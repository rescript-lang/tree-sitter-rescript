# tree-sitter-rescript

ReScript grammar for [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)

## Native libraries

Pushing a version tag such as `v6.0.1` builds and publishes native parser
libraries as GitHub Release assets:

| Platform | Asset |
| --- | --- |
| Linux x64 | `tree-sitter-rescript-linux-x64.so` |
| Windows x64 | `tree-sitter-rescript-windows-x64.dll` |
| macOS ARM64 | `tree-sitter-rescript-macos-arm64.dylib` |

These shared libraries export `tree_sitter_rescript` and use Tree-sitter language
ABI 15. Linux binaries are built on Ubuntu 22.04 and require glibc. Download the
asset for your platform and rename it as required by your editor or loader.

The workflow runs corpus tests on all three platforms before publishing. It also
builds PRs targeting `main` and retains their binaries as workflow artifacts.
Tags containing a hyphen, such as `v6.0.1-rc.1`, create prereleases. Rerunning a
tag workflow replaces matching assets on an existing release.

## Contributing

Contributions are welcome. Here’s how you can help:

🙂 Provide a minimal ReScript snippet which produces an `(ERROR)` node or otherwise incorrect syntax tree. Open a new issue providing this snippet and the resulting syntax tree. You can use the following command to see the syntax tree:

```bash
npm run parse path/to/file.res
```
