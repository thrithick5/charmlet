import AppKit

// WebDangle is a menu-bar-only app: no Dock icon, no main window, no storyboard.
// Everything it draws lives in a transparent, borderless overlay window.
//
// It also has a second mode. `--snapshot` renders a page offscreen and writes a PNG,
// which is how the build verifies what the product actually looks like on a machine
// where a headless browser cannot render.
let arguments = CommandLine.arguments

let bundleWebRoot = Bundle.main.resourceURL?.appendingPathComponent("web")
    ?? URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("web")

if let opts = Snapshotter.Options.parse(arguments) {
    Snapshotter.run(opts, webRoot: bundleWebRoot)
}

let app = NSApplication.shared
let delegate = AppDelegate()
AppDelegate.shared = delegate
app.delegate = delegate
app.setActivationPolicy(.accessory)
withExtendedLifetime(delegate) {
    app.run()
}
