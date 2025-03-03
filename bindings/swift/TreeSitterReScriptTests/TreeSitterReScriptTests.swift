import XCTest
import SwiftTreeSitter
import TreeSitterReScript

final class TreeSitterReScriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rescript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading ReScript grammar")
    }
}
