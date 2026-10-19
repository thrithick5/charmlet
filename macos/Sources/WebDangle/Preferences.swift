import Foundation

/// Everything the app remembers between launches.
enum Prefs {
    private static let d = UserDefaults.standard

    private static func registerDefaults() {
        d.register(defaults: [
            "charmId": "clover",
            "visible": true,
            "behind": false,
            "anchorX": 0.82,
            "cordLength": 100.0,
            "charmWidth": 90.0,
            "sound": false,
        ])
    }

    static func bootstrap() {
        registerDefaults()
        // Migrate legacy 220.0 default to Apple standard 170.0
        if d.double(forKey: "cordLength") == 220.0 {
            d.set(170.0, forKey: "cordLength")
        }
    }

    static var charmId: String {
        get { d.string(forKey: "charmId") ?? "clover" }
        set { d.set(newValue, forKey: "charmId") }
    }

    static var visible: Bool {
        get { d.bool(forKey: "visible") }
        set { d.set(newValue, forKey: "visible") }
    }

    static var behind: Bool {
        get { d.bool(forKey: "behind") }
        set { d.set(newValue, forKey: "behind") }
    }

    static var anchorX: Double {
        get { d.double(forKey: "anchorX") }
        set { d.set(newValue, forKey: "anchorX") }
    }

    static var cordLength: Double {
        get { d.double(forKey: "cordLength") }
        set { d.set(newValue, forKey: "cordLength") }
    }

    static var charmWidth: Double {
        get { d.double(forKey: "charmWidth") }
        set { d.set(newValue, forKey: "charmWidth") }
    }

    static var sound: Bool {
        get { d.bool(forKey: "sound") }
        set { d.set(newValue, forKey: "sound") }
    }

    static let launchAtLoginKey = "launchAtLogin"
}
