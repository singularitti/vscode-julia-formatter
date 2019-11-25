# Julia Formatter Extension

## Features

This is a [Julia language](https://julialang.org/) formatter using
[`JuliaFormatter.jl`](https://github.com/domluna/JuliaFormatter.jl). The
[Julia extension](https://marketplace.visualstudio.com/items?itemName=julialang.language-julia)
uses [`DocumentFormat`](https://github.com/julia-vscode/DocumentFormat.jl).
They differ by some decisions.

## Requirements

1. [The Julia executable >= 1.0](https://julialang.org/downloads/)
2. Though this extension will try to install it, we still recommend that you install
   [`JuliaFormatter.jl`](https://github.com/domluna/JuliaFormatter.jl) before installing
   this extension. To do this, open the REPL and type
   ```julia
   ]add JuliaFormatter
   ```

## Extension Settings

This extension contributes the following settings:

* `juliaFormatter.margin`: The maximum number of characters of code on a single line.
  Lines over the limit will be wrapped if possible. There are cases where lines cannot be
  wrapped and they will still end up wider than the requested margin. `92` by default.
* `juliaFormatter.indent`: The number of spaces used for an indentation. `4` by default.
* `juliaFormatter.alwaysForIn`: Always replaces `=` with `in` for `for` loops.
  For example, `for i = 1:10` will be transformed to `for i in 1:10`. `true` by default.
* `juliaFormatter.overwrite`: Writes the formatted source to a new file where
  the original filename is suffixed with _fmt, i.e. `filename_fmt.jl`. `true` by default.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for release notes.
