import AppKit
import ServiceManagement

/// Owns the menu bar item, the menu, the overlay, and the `luckydangle://` scheme.
final class AppDelegate: NSObject, NSApplicationDelegate {
    static var shared: AppDelegate?

    deinit {
        NSLog("[LuckyDangle] AppDelegate was deallocated!")
    }

    private var statusItem: NSStatusItem!
    private var dangle: DangleWindow!

    private var charms: [Charm] = CharmCatalog.fallback
    private var currentCharmId = Prefs.charmId

    // MARK: - Lifecycle

    func applicationDidFinishLaunching(_ notification: Notification) {
        Prefs.bootstrap()

        let webRoot = Bundle.main.resourceURL?.appendingPathComponent("web")
            ?? URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("web")

        guard FileManager.default.fileExists(atPath: webRoot.appendingPathComponent("charm.html").path) else {
            fail("The charm engine is missing", "Expected charm.html inside \(webRoot.path). Re-run macos/build.sh so the web engine is copied into the app bundle.")
            return
        }

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.image = Self.menuBarIcon()
        statusItem.button?.image?.isTemplate = true
        statusItem.button?.toolTip = "Charmlet"

        dangle = DangleWindow(webRoot: webRoot)
        dangle.onCharmChanged = { [weak self] id in
            guard let self else { return }
            self.currentCharmId = id
            self.rebuildMenu()
        }
        dangle.onCatalogLoaded = { [weak self] charms in
            guard let self else { return }
            self.charms = charms
            self.rebuildMenu()
            NSLog("[Charmlet] charm catalogue loaded from the engine: \(charms.count) charms")
        }

        rebuildMenu()
        Shortcuts.install(
            onToggle: { [weak self] in self?.toggleVisible() },
            onRitual: { [weak self] in self?.dangle.ritual() }
        )

        registerURLHandler()

        // Give the page a moment to boot, then sync the menu with the real list.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.dangle.loadCatalog()
        }

        NSLog("[Charmlet] ready — charm '\(Prefs.charmId)' on \(NSScreen.main?.localizedName ?? "main display")")
    }

    func applicationWillTerminate(_ notification: Notification) {
    }

    /// The app has no windows, so it must not quit when one closes.
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    // MARK: - Menu

    private func rebuildMenu() {
        let menu = NSMenu()

        let header = NSMenuItem(title: CharmCatalog.name(for: currentCharmId), action: nil, keyEquivalent: "")
        header.isEnabled = false
        menu.addItem(header)
        menu.addItem(.separator())

        add(to: menu, "Show / Hide Charm", #selector(toggleVisible), "d", [.control])
        add(to: menu, "Perform Ritual", #selector(performRitual), "s", [.control])
        add(to: menu, "Flick It", #selector(flickIt), "f", [.control])
        menu.addItem(.separator())

        let charmMenu = NSMenu()
        for charm in charms {
            let item = NSMenuItem(title: charm.name, action: #selector(selectCharm(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = charm.id
            item.state = charm.id == currentCharmId ? .on : .off
            charmMenu.addItem(item)
        }
        charmMenu.addItem(.separator())
        add(to: charmMenu, "Next Charm", #selector(nextCharm), "]", [.command, .shift])
        add(to: charmMenu, "Previous Charm", #selector(previousCharm), "[", [.command, .shift])

        let charmItem = NSMenuItem(title: "Charm", action: nil, keyEquivalent: "")
        charmItem.submenu = charmMenu
        menu.addItem(charmItem)

        // Charm Size submenu
        let sizeMenu = NSMenu()
        let sizes: [(String, Double)] = [
            ("Compact (90 px)", 90.0),
            ("Small (115 px)", 115.0),
            ("Medium (158 px)", 158.0),
            ("Large (200 px)", 200.0),
        ]
        let currentWidth = Prefs.charmWidth
        for (label, width) in sizes {
            let item = NSMenuItem(title: label, action: #selector(selectSize(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = width
            item.state = abs(currentWidth - width) < 14.0 ? .on : .off
            sizeMenu.addItem(item)
        }
        let sizeItem = NSMenuItem(title: "Charm Size", action: nil, keyEquivalent: "")
        sizeItem.submenu = sizeMenu
        menu.addItem(sizeItem)

        // Cord Length submenu
        let lengthMenu = NSMenu()
        let lengths: [(String, Double)] = [
            ("Compact (100 px)", 100.0),
            ("Short (140 px)", 140.0),
            ("Medium (170 px)", 170.0),
            ("Long (250 px)", 250.0),
        ]
        let currentLength = Prefs.cordLength
        for (label, len) in lengths {
            let item = NSMenuItem(title: label, action: #selector(selectLength(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = len
            item.state = abs(currentLength - len) < 20.0 ? .on : .off
            lengthMenu.addItem(item)
        }
        let lengthItem = NSMenuItem(title: "Cord Length", action: nil, keyEquivalent: "")
        lengthItem.submenu = lengthMenu
        menu.addItem(lengthItem)

        // Screen Placement submenu
        let posMenu = NSMenu()
        let positions: [(String, Double)] = [
            ("Left (15%)", 0.15),
            ("Center-Left (35%)", 0.35),
            ("Center (50%)", 0.50),
            ("Center-Right (68%)", 0.68),
            ("Right (82%)", 0.82),
        ]
        let currentAnchor = Prefs.anchorX
        for (label, frac) in positions {
            let item = NSMenuItem(title: label, action: #selector(selectPosition(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = frac
            item.state = abs(currentAnchor - frac) < 0.08 ? .on : .off
            posMenu.addItem(item)
        }
        let posItem = NSMenuItem(title: "Screen Placement", action: nil, keyEquivalent: "")
        posItem.submenu = posMenu
        menu.addItem(posItem)

        menu.addItem(.separator())

        let behind = add(to: menu, "Send Behind Windows", #selector(toggleBehind), "", [])
        behind.state = Prefs.behind ? .on : .off

        let soundItem = add(to: menu, "Sound", #selector(toggleSound), "", [])
        soundItem.state = Prefs.sound ? .on : .off

        add(to: menu, "Re-center on Screen", #selector(recenter), "0", [.command])
        menu.addItem(.separator())

        let login = add(to: menu, "Launch at Login", #selector(toggleLaunchAtLogin), "", [])
        login.state = launchAtLoginEnabled ? .on : .off

        add(to: menu, "Open the Website", #selector(openWebsite), "", [])
        menu.addItem(.separator())

        add(to: menu, "Quit Charmlet", #selector(quitApp), "q", [.command])

        statusItem.menu = menu
    }

    @discardableResult
    private func add(to menu: NSMenu, _ title: String, _ action: Selector, _ key: String, _ modifiers: NSEvent.ModifierFlags) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: key)
        item.target = self
        if !key.isEmpty { item.keyEquivalentModifierMask = modifiers }
        menu.addItem(item)
        return item
    }

    // MARK: - Actions

    @objc private func toggleVisible() {
        dangle.setVisible(!Prefs.visible)
        rebuildMenu()
    }

    @objc private func performRitual() { dangle.ritual() }
    @objc private func flickIt() { dangle.flick() }

    @objc private func selectCharm(_ sender: NSMenuItem) {
        guard let id = sender.representedObject as? String else { return }
        currentCharmId = id
        dangle.setCharm(id)
        rebuildMenu()
    }

    @objc private func selectSize(_ sender: NSMenuItem) {
        guard let width = sender.representedObject as? Double else { return }
        dangle.setSize(width)
        rebuildMenu()
    }

    @objc private func selectLength(_ sender: NSMenuItem) {
        guard let len = sender.representedObject as? Double else { return }
        dangle.setCordLength(len)
        rebuildMenu()
    }

    @objc private func selectPosition(_ sender: NSMenuItem) {
        guard let frac = sender.representedObject as? Double else { return }
        dangle.setAnchor(fraction: frac)
        rebuildMenu()
    }

    @objc private func nextCharm() { dangle.cycle(1) }
    @objc private func previousCharm() { dangle.cycle(-1) }

    @objc private func toggleBehind() {
        dangle.setBehind(!Prefs.behind)
        rebuildMenu()
    }

    @objc private func toggleSound() {
        dangle.setSound(!Prefs.sound)
        rebuildMenu()
    }

    @objc private func recenter() { dangle.recenter() }
    @objc private func quitApp() {
        NSLog("[LuckyDangle] Quit selected by user")
        NSApplication.shared.terminate(nil)
    }

    @objc private func openWebsite() {
        if let url = Bundle.main.resourceURL?.appendingPathComponent("web/index.html"),
           FileManager.default.fileExists(atPath: url.path) {
            NSWorkspace.shared.open(url)
        } else {
            // Personal local build: there is no remote site to fall back to.
            NSLog("[LuckyDangle] bundled website not found in Resources")
        }
    }

    // MARK: - Launch at login

    private var launchAtLoginEnabled: Bool {
        if #available(macOS 13.0, *) {
            return SMAppService.mainApp.status == .enabled
        }
        return false
    }

    @objc private func toggleLaunchAtLogin() {
        guard #available(macOS 13.0, *) else {
            notify("Not supported", "Launch at login needs macOS 13 or later.")
            return
        }
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            notify(
                "Could not change the login item",
                "\(error.localizedDescription)\n\nThis normally means the app is not running from a real .app bundle in a stable location. Move WebDangle.app to /Applications and try again."
            )
        }
        rebuildMenu()
    }

    // MARK: - luckydangle:// URL scheme

    private func registerURLHandler() {
        NSAppleEventManager.shared().setEventHandler(
            self,
            andSelector: #selector(handleURL(event:reply:)),
            forEventClass: AEEventClass(kInternetEventClass),
            andEventID: AEEventID(kAEGetURL)
        )
    }

    @objc private func handleURL(event: NSAppleEventDescriptor, reply: NSAppleEventDescriptor) {
        guard let string = event.paramDescriptor(forKeyword: keyDirectObject)?.stringValue,
              let url = URL(string: string) else { return }
        route(url)
    }

    /// Routes `charmlet://` (and legacy `luckydangle://`) links. `bless` is the primary route.
    func route(_ url: URL) {
        let scheme = url.scheme?.lowercased()
        guard scheme == "charmlet" || scheme == "luckydangle" else { return }
        NSLog("[Charmlet] url route: \(url.absoluteString)")
        let host = (url.host ?? url.path.replacingOccurrences(of: "/", with: "")).lowercased()

        switch host {
        case "bless", "":
            dangle.bless()
        case "ritual":
            dangle.ritual()
        case "show":
            dangle.setVisible(true)
            rebuildMenu()
        case "hide":
            dangle.setVisible(false)
            rebuildMenu()
        case "flick":
            dangle.flick()
        case "next":
            dangle.cycle(1)
        case "prev":
            dangle.cycle(-1)
        case "charm":
            if let id = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "id" })?.value {
                currentCharmId = id
                dangle.setCharm(id)
                rebuildMenu()
            }
        default:
            NSLog("[LuckyDangle] unknown URL route: \(url.absoluteString)")
        }
    }

    // MARK: - Helpers

    private func notify(_ title: String, _ body: String) {
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = body
        alert.alertStyle = .informational
        alert.addButton(withTitle: "OK")
        NSApp.activate(ignoringOtherApps: true)
        alert.runModal()
    }

    private func fail(_ title: String, _ body: String) {
        notify(title, body)
        NSApp.terminate(nil)
    }

    /// A crisp four-leaf clover glyph for the menu bar (Apple template image).
    private static func menuBarIcon() -> NSImage {
        let size = NSSize(width: 18, height: 18)
        let image = NSImage(size: size, flipped: false) { _ in
            let center = NSPoint(x: 9, y: 10)

            // Four clover lobes: North, East, South, West
            for i in 0..<4 {
                let angle = CGFloat(i) * (.pi / 2)
                let cosA = cos(angle)
                let sinA = sin(angle)
                let dist: CGFloat = 4.2
                let pc = NSPoint(x: center.x + cosA * dist, y: center.y + sinA * dist)
                let r: CGFloat = 3.6
                let petal = NSBezierPath(ovalIn: NSRect(x: pc.x - r, y: pc.y - r, width: r * 2, height: r * 2))
                petal.fill()
            }

            // Center connecting core
            let core = NSBezierPath(ovalIn: NSRect(x: center.x - 2.8, y: center.y - 2.8, width: 5.6, height: 5.6))
            core.fill()

            // Curved stem
            let stem = NSBezierPath()
            stem.lineWidth = 1.3
            stem.lineCapStyle = .round
            stem.move(to: NSPoint(x: center.x, y: center.y - 2.5))
            stem.curve(to: NSPoint(x: center.x + 3.0, y: 1.5),
                       controlPoint1: NSPoint(x: center.x, y: 5.0),
                       controlPoint2: NSPoint(x: center.x + 1.5, y: 2.5))
            stem.stroke()
            return true
        }
        image.isTemplate = true
        return image
    }
}
