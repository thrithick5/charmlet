// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Charmlet",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "Charmlet",
            path: "Sources/WebDangle",
            linkerSettings: [
                .linkedFramework("Cocoa"),
                .linkedFramework("WebKit"),
                .linkedFramework("Carbon"),
            ]
        )
    ]
)
