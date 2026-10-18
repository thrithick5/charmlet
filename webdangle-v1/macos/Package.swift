// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "WebDangle",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "WebDangle",
            path: "Sources/WebDangle",
            linkerSettings: [
                .linkedFramework("Cocoa"),
                .linkedFramework("WebKit"),
                .linkedFramework("Carbon"),
            ]
        )
    ]
)
