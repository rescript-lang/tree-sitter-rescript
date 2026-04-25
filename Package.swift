// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterReScript",
    products: [
        .library(name: "TreeSitterReScript", targets: ["TreeSitterReScript"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterReScript",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterReScriptTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterReScript",
            ],
            path: "bindings/swift/TreeSitterReScriptTests"
        )
    ],
    cLanguageStandard: .c11
)
