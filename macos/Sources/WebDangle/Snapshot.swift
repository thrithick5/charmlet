import AppKit
import WebKit

/// Offscreen rendering, for verification.
///
/// This exists because Chromium-family headless browsers cannot render in every
/// environment, and "I could not take a screenshot" is not an acceptable answer for
/// a product whose entire value is visual. WebKit renders happily here, and the app
/// already hosts the same engine, so it can photograph itself.
///
///     WebDangle --snapshot out.png [--width 1440] [--height 1000] [--wait 2.5] [--page charm.html]
///
/// The snapshot is of a real, live page: the physics has run, the gallery has been
/// built, the charms are hanging.
enum Snapshotter {

    struct Options {
        var out: String
        var width: Double = 1440
        var height: Double = 1000
        var wait: Double = 2.5
        var page: String = "charm.html"
        var transparent = false
        /// Print the rig's live metrics as JSON instead of guessing from pixels.
        var probe = false

        /// Parse `--snapshot out.png --width 1440 …`.
        static func parse(_ args: [String]) -> Options? {
            guard let i = args.firstIndex(of: "--snapshot"), i + 1 < args.count else { return nil }
            var o = Options(out: args[i + 1])

            func value(_ flag: String) -> String? {
                guard let j = args.firstIndex(of: flag), j + 1 < args.count else { return nil }
                return args[j + 1]
            }

            if let v = value("--width"), let d = Double(v) { o.width = d }
            if let v = value("--height"), let d = Double(v) { o.height = d }
            if let v = value("--wait"), let d = Double(v) { o.wait = d }
            if let v = value("--page") { o.page = v }
            if args.contains("--transparent") { o.transparent = true }
            if args.contains("--probe") { o.probe = true }
            return o
        }
    }

    static func run(_ opts: Options, webRoot: URL) -> Never {
        let app = NSApplication.shared
        app.setActivationPolicy(.accessory)

        let size = CGSize(width: opts.width, height: opts.height)

        let handler = ResourceSchemeHandler(root: webRoot)
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(handler, forURLScheme: ResourceSchemeHandler.scheme)
        config.suppressesIncrementalRendering = false

        let webView = WKWebView(frame: CGRect(origin: .zero, size: size), configuration: config)
        webView.setValue(!opts.transparent, forKey: "drawsBackground")
        if webView.responds(to: Selector(("_setDrawsBackground:"))) {
            webView.perform(Selector(("_setDrawsBackground:")), with: (opts.transparent ? false : true) as NSNumber)
        }
        if opts.transparent, #available(macOS 12.0, *) {
            webView.underPageBackgroundColor = .clear
        }

        // An ordered window is needed: an unhosted WKWebView does not composite.
        let window = NSWindow(
            contentRect: CGRect(origin: .zero, size: size),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.contentView = webView
        window.setFrameOrigin(NSPoint(x: 0, y: 0))
        window.orderFrontRegardless()

        var comps = URLComponents()
        comps.scheme = ResourceSchemeHandler.scheme
        comps.host = "app"
        // `--page "index.html#pricing"` scrolls to a section, and
        // `--page "charm.html?charm=boba"` picks a charm. Both are needed to
        // photograph a page taller than one snapshot, and each individual charm.
        let hashSplit = opts.page.split(separator: "#", maxSplits: 1, omittingEmptySubsequences: false)
        let querySplit = hashSplit[0].split(separator: "?", maxSplits: 1, omittingEmptySubsequences: false)
        comps.path = "/" + querySplit[0]
        if querySplit.count > 1 { comps.percentEncodedQuery = String(querySplit[1]) }
        if hashSplit.count > 1 { comps.fragment = String(hashSplit[1]) }
        guard let url = comps.url else {
            FileHandle.standardError.write(Data("bad page path\n".utf8))
            exit(2)
        }
        webView.load(URLRequest(url: url))

        DispatchQueue.main.asyncAfter(deadline: .now() + opts.wait) {
            let finish: () -> Void = {
                let cfg = WKSnapshotConfiguration()
                cfg.rect = CGRect(origin: .zero, size: size)
                cfg.snapshotWidth = NSNumber(value: opts.width)

                webView.takeSnapshot(with: cfg) { image, error in
                    guard let image,
                          let tiff = image.tiffRepresentation,
                          let rep = NSBitmapImageRep(data: tiff),
                          let png = rep.representation(using: .png, properties: [:])
                    else {
                        let why = error?.localizedDescription ?? "no image returned"
                        FileHandle.standardError.write(Data("snapshot failed: \(why)\n".utf8))
                        exit(1)
                    }
                    do {
                        try png.write(to: URL(fileURLWithPath: opts.out))
                        print("\(opts.out)  (\(png.count) bytes, \(Int(opts.width))x\(Int(opts.height)))")
                        exit(0)
                    } catch {
                        FileHandle.standardError.write(Data("write failed: \(error.localizedDescription)\n".utf8))
                        exit(1)
                    }
                }
            }

            guard opts.probe else {
                finish()
                return
            }

            // Print the rig's own numbers. Far more reliable than reading a tilt
            // angle off a PNG.
            webView.evaluateJavaScript(
                "JSON.stringify(window.luckydangle ? window.luckydangle.metrics() : {error:'no bridge'})"
            ) { result, _ in
                if let json = result as? String {
                    print("metrics: \(json)")
                }
                finish()
            }
        }

        // Hard stop, so a hung render can never wedge a build.
        DispatchQueue.main.asyncAfter(deadline: .now() + opts.wait + 25) {
            FileHandle.standardError.write(Data("snapshot timed out\n".utf8))
            exit(3)
        }

        app.run()
        exit(0)
    }
}
