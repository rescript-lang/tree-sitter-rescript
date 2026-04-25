# AGENTS.md

This file provides guidance to AI/LLM when working with code in this repository.

## Build and Test Commands

```bash
# Generate parser from grammar (required after grammar.js changes)
npx tree-sitter generate

# Run all corpus tests
npx tree-sitter test

# Run tests for a specific grammar rule (filter by name)
npx tree-sitter test --include "switch"

# Parse a file to see syntax tree (useful for debugging)
npm run parse path/to/file.res

# Compare with ReScript compiler's AST (useful for debugging grammar issues)
npx bsc -dparsetree -only-parse -ignore-parse-errors path/to/file.res

# Launch interactive playground (builds WASM first)
npm start

# Install npm dependencies
npm install
```

## Architecture

### Grammar Definition

**grammar.js** - The main grammar definition using Tree-sitter's JavaScript DSL. Key sections:
- `externals` - Tokens handled by the custom scanner (newlines, comments, template strings, decorators, parentheses)
- `precedences` - Operator precedence rules for expressions and module paths
- `conflicts` - Shift/reduce conflict resolutions for ambiguous constructs
- `rules` - All grammar rules (~80+ covering statements, expressions, types, modules, JSX)

### External Scanner

**src/scanner.c** - Custom C scanner for context-sensitive tokens that the grammar alone cannot handle:
- Significant vs insignificant newlines (statement-ending vs formatting)
- Nested multiline comments (`/* /* */ */`)
- Template string interpolation (`\`hello ${name}\``)
- Parenthesis nesting tracking (affects newline significance)
- `list{` and `dict{` constructor detection
- Decorator parsing (`@decorator` vs `@decorator(args)`)

The scanner maintains state (`ScannerState`) tracking parenthesis nesting depth, whether inside quotes/backticks, and EOF reporting.

### Generated Files (do not edit manually)

- `src/parser.c` - Generated LR parser from grammar.json
- `src/grammar.json` - Intermediate grammar representation
- `src/node-types.json` - AST node type definitions

### Query Files

**queries/** - TreeSitter query files in S-expression syntax:
- `highlights.scm` - Syntax highlighting rules mapping AST nodes to semantic scopes
- `injections.scm` - Language injection boundaries
- `locals.scm` - Variable scope definitions
- `textobjects.scm` - Editor text object definitions

### Test Corpus

**test/corpus/*.txt** - Test cases in Tree-sitter's corpus format. Each test has a name, ReScript code, and expected parse tree. Files cover: comments, decorators, expressions, functions, JSX, let bindings, literals, modules, type declarations.

## Development Workflow

1. Modify `grammar.js` to add/fix grammar rules
2. Run `tree-sitter generate` to regenerate the parser
3. Add test cases in `test/corpus/*.txt` with expected parse trees
4. Run `tree-sitter test` to verify
5. For scanner changes, edit `src/scanner.c` and rebuild

## Language Bindings

Bindings are provided for Node.js, Python, Rust, Go, Swift, and C in the `bindings/` directory. CI tests Rust, Python, and Go bindings automatically.
