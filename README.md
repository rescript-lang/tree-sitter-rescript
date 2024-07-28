# tree-sitter-rescript

ReScript grammar for [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)

## Contributing

Contributions are welcome. Here’s how you can help:

🙂 Provide a minimal ReScript snippet which produces an `(ERROR)` node or otherwise incorrect syntax tree. Open a new issue providing this snippet and the resulting syntax tree. You can use the following command to see the syntax tree:

```bash
yarn tree-sitter parse /path/to/your/snippet.res
```

🤩 Add a failing test case for a snippet which is valid ReScript but produces an incorrect syntax tree. Fix the `grammar.js`. Make sure nothing is broken: `make test test_wild` shows 100% test success. Open a pull request.
