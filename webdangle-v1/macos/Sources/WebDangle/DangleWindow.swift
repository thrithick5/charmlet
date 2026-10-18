import AppKit
import WebKit

/// A borderless window that refuses key status.
///
/// This matters more than it looks. If the overlay could become key, clicking the
/// charm would pull focus away from whatever the user is actually working in —
/// you would be typing in your editor, flick the spider, and lose your place.
/// Refusing key status means the charm is grabbable without ever stealing focus.
final class OverlayWindow: NSWindow {
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}

/// A web view that accepts the very first click, even though its window is not key.
/// Without this the first grab is swallowed as an activation click.
final class FirstMouseWebView: WKWebView {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// The overlay: one transparent, full-screen window per display, hosting the same
/// charm engine the website uses.
///
/// ## How click-through works
///
/// A window either takes mouse events or it does not. A full-screen overlay that
/// takes them would swallow the entire desktop, so the window starts inert
/// (`ignoresMouseEvents = true`) and every click passes to whatever is underneath.
///
/// Keeping the charm grabbable anyway needs three pieces:
///
///  1. The page reports the charm's real on-screen rectangle ten times a second.
///  2. **Global** mouse-moved monitors track the pointer while the window is inert.
///     Global monitors do not fire for events delivered to our own app, so a
///     **local** monitor covers the case where the window is currently accepting
///     events. Both feed the same function.
///  3. When the pointer is inside the charm's rectangle the window stops ignoring
///     mouse events; when it leaves — or the moment the charm is dropped — it goes
///     straight back to inert. While a drag is in progress the window is pinned
///     open, otherwise a fast flick would hand the pointer back mid-grab.
///
/// Net result: the charm is the only pixel on the screen that can consume a click.
final class DangleWindow: NSObject {

    let window: OverlayWindow
    private let webView: FirstMouseWebView
    private let schemeHandler: ResourceSchemeHandler

    private var globalMonitor: Any?
    private var localMonitor: Any?
    private var metricsTimer: Timer?
    private var isPolling = false

    // Live state reported by the page.
    private var charmRect: CGRect = .zero
    private var charmGrabbed = false
    private var charmIsVisible = true
    private var currentCharmId = "slinger"

    private var passingThrough = true

    /// Fired whenever the charm changes, so the menu can re-check the right row.
    var onCharmChanged: ((String) -> Void)?
    /// Fired when the page reports the real charm list.
    var onCatalogLoaded: (([Charm]) -> Void)?

    init(webRoot: URL) {
        schemeHandler = ResourceSchemeHandler(root: webRoot)

        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(schemeHandler, forURLScheme: ResourceSchemeHandler.scheme)
        config.suppressesIncrementalRendering = false

        webView = FirstMouseWebView(frame: .zero, configuration: config)

        let screen = NSScreen.main ?? NSScreen.screens.first
        let frame = screen?.frame ?? CGRect(x: 0, y: 0, width: 1440, height: 900)

        window = OverlayWindow(
            contentRect: frame,
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )

        super.init()

        // Transparent, always available, never in the window cycle.
        window.isOpaque = false
        window.backgroundColor = .clear
        window.hasShadow = false
        window.level = Prefs.behind ? .normal : .floating
        window.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary, .ignoresCycle]
        window.ignoresMouseEvents = true
        window.isMovableByWindowBackground = false
        window.animationBehavior = .none
        window.contentView = webView

        webView.autoresizingMask = [.width, .height]
        webView.frame = CGRect(origin: .zero, size: frame.size)

        // The public way to drop the page background, plus the KVC fallback that
        // still does the real work on some OS versions.
        if #available(macOS 12.0, *) {
            webView.underPageBackgroundColor = .clear
        }
        if webView.responds(to: Selector(("setDrawsBackground:"))) {
            webView.setValue(false, forKey: "drawsBackground")
        }

        loadCharm()
        startTracking()
        startMetricsPolling()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(screenParametersChanged),
            name: NSApplication.didChangeScreenParametersNotification,
            object: nil
        )

        window.orderFrontRegardless()
        applyVisibility(Prefs.visible)
    }

    deinit {
        metricsTimer?.invalidate()
        if let globalMonitor { NSEvent.removeMonitor(globalMonitor) }
        if let localMonitor { NSEvent.removeMonitor(localMonitor) }
    }

    // MARK: - Loading

    private func loadCharm() {
        var comps = URLComponents()
        comps.scheme = ResourceSchemeHandler.scheme
        comps.host = "app"
        comps.path = "/charm.html"
        comps.queryItems = [
            URLQueryItem(name: "charm", value: Prefs.charmId),
            URLQueryItem(name: "length", value: String(Int(Prefs.cordLength))),
            URLQueryItem(name: "width", value: String(Int(Prefs.charmWidth))),
            URLQueryItem(name: "anchorX", value: String(Prefs.anchorX)),
            URLQueryItem(name: "muted", value: Prefs.sound ? "0" : "1"),
        ]
        guard let url = comps.url else { return }
        currentCharmId = Prefs.charmId
        webView.load(URLRequest(url: url))
    }

    // MARK: - JavaScript bridge

    @discardableResult
    func call(_ script: String, then: ((Any?) -> Void)? = nil) -> Bool {
        guard webView.url != nil else { return false }
        webView.evaluateJavaScript(script) { result, error in
            if let error {
                NSLog("[WebDangle] js error: \(error.localizedDescription)")
            }
            then?(result)
        }
        return true
    }

    private func startMetricsPolling() {
        metricsTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            self?.pollMetrics()
        }
        metricsTimer?.tolerance = 0.03
    }

    private func pollMetrics() {
        guard !isPolling, window.isVisible else { return }
        isPolling = true
        call("window.webdangle ? window.webdangle.metrics() : null") { [weak self] result in
            guard let self else { return }
            self.isPolling = false
            guard let dict = result as? [String: Any] else { return }

            if let r = dict["rect"] as? [String: Any],
               let x = (r["x"] as? NSNumber)?.doubleValue,
               let y = (r["y"] as? NSNumber)?.doubleValue,
               let w = (r["width"] as? NSNumber)?.doubleValue,
               let h = (r["height"] as? NSNumber)?.doubleValue {
                self.charmRect = CGRect(x: x, y: y, width: w, height: h)
            }

            self.charmGrabbed = (dict["grabbed"] as? Bool) ?? (dict["grabbed"] as? NSNumber)?.boolValue ?? false
            self.charmIsVisible = (dict["visible"] as? Bool) ?? true

            if let id = dict["charm"] as? String, id != self.currentCharmId {
                self.currentCharmId = id
                self.onCharmChanged?(id)
            }

            self.updatePassThrough()
        }
    }

    // MARK: - Pointer tracking

    private func startTracking() {
        let mask: NSEvent.EventTypeMask = [.mouseMoved, .leftMouseDragged, .leftMouseDown, .leftMouseUp]

        // Fires while the window is inert and the pointer belongs to another app.
        globalMonitor = NSEvent.addGlobalMonitorForEvents(matching: mask) { [weak self] _ in
            self?.updatePassThrough()
        }

        // Fires while the window is accepting events, when the global monitor is silent.
        localMonitor = NSEvent.addLocalMonitorForEvents(matching: mask) { [weak self] event in
            self?.updatePassThrough()
            return event
        }
    }

    /// Decide, right now, whether a click at the pointer should reach the charm.
    private func updatePassThrough() {
        guard charmIsVisible, window.isVisible else {
            setPassThrough(true)
            return
        }
        // Never hand the pointer back mid-drag: a fast flick would drop the grab.
        guard !charmGrabbed else {
            setPassThrough(false)
            return
        }

        let mouse = NSEvent.mouseLocation
        let frame = window.frame
        // AppKit screen coordinates are bottom-left origin; the page reports top-left.
        let point = CGPoint(x: mouse.x - frame.minX, y: frame.maxY - mouse.y)

        // A little slack so the edges of the artwork are not fiddly to hit.
        let hit = charmRect.insetBy(dx: -10, dy: -10)
        setPassThrough(!hit.contains(point))
    }

    private func setPassThrough(_ on: Bool) {
        guard on != passingThrough || window.ignoresMouseEvents != on else { return }
        passingThrough = on
        window.ignoresMouseEvents = on
    }

    // MARK: - Commands

    func setCharm(_ id: String) {
        Prefs.charmId = id
        currentCharmId = id
        call("window.webdangle.setCharm(\(jsString(id)))")
        onCharmChanged?(id)
    }

    func cycle(_ step: Int) {
        call("window.webdangle.cycle(\(step))") { [weak self] result in
            guard let self, let id = result as? String else { return }
            self.currentCharmId = id
            Prefs.charmId = id
            self.onCharmChanged?(id)
        }
    }

    func ritual() {
        // Rituals are the point; make sure the charm is on screen to perform one.
        if !Prefs.visible { setVisible(true) }
        call("window.webdangle.ritual()")
    }

    func bless() {
        if !Prefs.visible { setVisible(true) }
        call("window.webdangle.bless()")
    }

    func flick() {
        call("window.webdangle.flick()")
    }

    func setVisible(_ on: Bool) {
        Prefs.visible = on
        call("window.webdangle.setVisible(\(on))")
        applyVisibility(on)
    }

    private func applyVisibility(_ on: Bool) {
        charmIsVisible = on
        if on {
            window.orderFrontRegardless()
        } else {
            // Keep the window alive; just stop it interacting at all.
            setPassThrough(true)
        }
    }

    func setBehind(_ on: Bool) {
        Prefs.behind = on
        window.level = on ? .normal : .floating
        if on {
            window.orderBack(nil)
        } else {
            window.orderFrontRegardless()
        }
        call("window.webdangle.setBehind(\(on))")
    }

    func setSound(_ on: Bool) {
        Prefs.sound = on
        call("window.webdangle.setSound(\(on))")
    }

    /// Put the charm back in the middle of the screen it is currently on.
    func recenter() {
        Prefs.anchorX = 0.5
        call("window.webdangle.setAnchor(0.5, 0)")
    }

    func setAnchor(fraction: Double) {
        Prefs.anchorX = fraction
        call("window.webdangle.setAnchor(\(fraction), 0)")
    }

    func setCordLength(_ px: Double) {
        Prefs.cordLength = px
        call("window.webdangle.setLength(\(px))")
    }

    func loadCatalog() {
        call("window.webdangle.list()") { [weak self] result in
            guard let rows = result as? [[String: Any]] else { return }
            let charms: [Charm] = rows.compactMap { row in
                guard let id = row["id"] as? String, let name = row["name"] as? String else { return nil }
                return Charm(id: id, name: name, ritual: (row["ritual"] as? String) ?? "Ritual")
            }
            guard !charms.isEmpty else { return }
            self?.onCatalogLoaded?(charms)
        }
    }

    // MARK: - Display changes

    @objc private func screenParametersChanged() {
        guard let screen = NSScreen.main ?? NSScreen.screens.first else { return }
        window.setFrame(screen.frame, display: true)
        webView.frame = CGRect(origin: .zero, size: screen.frame.size)
    }

    // MARK: - Helpers

    /// Quote a Swift string for safe interpolation into JavaScript.
    private func jsString(_ value: String) -> String {
        let escaped = value
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
        return "'\(escaped)'"
    }
}
