# ReScript grammar for Tree-sitter

This repository contains a parser definition of the [ReScript](https://rescript-lang.org/) language for the [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) parser generator tool.

Athough Tree-sitter has many applications, the main intent of this parser is powering the [`nvim-treesitter-rescript`](https://github.com/nkrkv/nvim-tree-sitter-rescript/) NeoVim plugin which may be used to improve development experience in the NeoVim + ReScript combo.

Queries for text objects are also included which help you to navigate, select, and modify ReScript code syntactically. For NeoVim, the [`nvim-treesitter-textobjects`](https://github.com/nvim-treesitter/nvim-treesitter-textobjects) plugin is required to use Tree-sitter text objects.

## Installation

### Neovim

If you want ReScript Tree-sitter in NeoVim, you will first need to register a new parser for it like so:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.rescript = {
  install_info = {
    url = "https://github.com/nkrkv/tree-sitter-rescript",
    branch = "main",
    files = { "src/scanner.c" },
    generate_requires_npm = false,
    requires_generate_from_grammar = true,
    use_makefile = true, -- macOS specific instruction
  },
}
```

This will make `TSInstall rescript` globally available. For more persistent approach you should add this parser to your Lua configuration.

Default configuration detects `.res` and `.resi` files. You can confirm that it's correctly installed by using [`nvim-treesitter/playground`](https://github.com/nvim-treesitter/playground) and invoking `TSPlaygroundToggle` when you are in the ReScript file.

- Notice that by default you will not see the highlighting! To enable highlighting, you will need to install this package either as a dependency or directly.

If you are using `lazy.nvim` example configuration will look like so:

```lua
  {
    "nvim-treesitter/nvim-treesitter",
    dependencies = {
      "nkrkv/tree-sitter-rescript"
    },
    opts = function(_, opts) -- this is needed so you won't override your default nvim-treesitter configuration
      vim.list_extend(opts.ensure_installed, {
        "rescript",
      })

      local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
      parser_config.rescript = {
        install_info = {
          url = "https://github.com/nkrkv/tree-sitter-rescript",
          branch = "main",
          files = { "src/scanner.c" },
          generate_requires_npm = false,
          requires_generate_from_grammar = true,
          use_makefile = true, -- macOS specific instruction
        },
      }
    end,
  }
```

- Legacy way of installing the parser is available via [`nvim-treesitter-rescript`](https://github.com/nkrkv/nvim-tree-sitter-rescript/)
- If you want it for other purposes, you probably know what to do.

## Contributing

Contributions are welcome. Here’s how you can help:

🙂 Provide a minimal ReScript snippet which produces an `(ERROR)` node or otherwise incorrect syntax tree. Open a new issue providing this snippet and the resulting syntax tree. You can use the following command to see the syntax tree:

```bash
yarn tree-sitter parse /path/to/your/snippet.res
```

🤩 Add a failing test case for a snippet which is valid ReScript but produces an incorrect syntax tree. Fix the `grammar.js`. Make sure nothing is broken: `make test test_wild` shows 100% test success. Open a pull request.
