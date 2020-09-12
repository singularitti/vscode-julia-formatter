# Julia Formatter Extension

[![Build Status](https://dev.azure.com/singularitti/vscode-julia-formatter/_apis/build/status/singularitti.vscode-julia-formatter?branchName=master)](https://dev.azure.com/singularitti/vscode-julia-formatter/_build/latest?definitionId=1&branchName=master)

## Features

This is a [Julia language](https://julialang.org/) formatter using the
[`JuliaFormatter.jl`](https://github.com/domluna/JuliaFormatter.jl) package. The
[Julia extension](https://marketplace.visualstudio.com/items?itemName=julialang.language-julia)
uses the [`DocumentFormat`](https://github.com/julia-vscode/DocumentFormat.jl) package.
They differ by some decisions.

## Requirements

1. [The Julia executable >= 1.0](https://julialang.org/downloads/)
2. Though this extension will try to install it, we still recommend that you install
   [`JuliaFormatter.jl`](https://github.com/domluna/JuliaFormatter.jl) before installing
   this extension. To do this, open the REPL and type
   ```julia
   ]add JuliaFormatter
   ```
   It is better to install the latest version of `JuliaFormatter`, since some settings
   require that.

## Extension Settings

This extension contributes the following settings:

* `juliaFormatter.margin`: The maximum number of characters of code on a single line. Lines
  over the limit will be wrapped if possible. There are cases where lines cannot be wrapped
  and they will still end up wider than the requested margin. `92` by default.
* `juliaFormatter.indent`: The number of spaces used for an indentation. `4` by default.
* `juliaFormatter.alwaysForIn`: Always replaces `=` with `in` for `for` loops. For example,
  `for i = 1:10` will be transformed to `for i in 1:10`. `false` by default.
* `juliaFormatter.whitespaceTypedefs` : If `true`, whitespace is added for type
  definitions. Make this `true` if you prefer `Union{A <: B, C}` to `Union{A<:B,C}` .
* `juliaFormatter.whitespaceOpsInIndices` : If `true`, whitespace is added for binary
  operations in indices. Make this `true` if you prefer `arr[a + b]` to `arr[a+b]` .
* `juliaFormatter.removeExtraNewlines`: If `true`, superflous newlines will be removed.
* `juliaFormatter.importToUsing`: If `true`, `import` expressions are rewritten to `using`
  expressions.
* `juliaFormatter.pipeToFunctionCall`: If `true`, `x |> f` is rewritten to `f(x)`.
* `juliaFormatter.shortToLongFunctionDef`: Transforms a short function definition to a long
  function definition.
* `juliaFormatter.alwaysUseReturn`: If `true`, `return` will be prepended to the last
  expression where applicable in function definitions, macro definitions, and do blocks.
* `juliaFormatter.compile`: Control the compilation level of Julia. Available values are
  'min' or 'all'.
* `juliaFormatter.style`: Formatting styles. Choose from: `'default'` and `'yas'`.
* `juliaFormatter.annotateUntypedFieldsWithAny`: If `true`, Annotates fields in a type
  definitions with `::Any` if no type annotation is provided (Requires
  `JuliaFormatter.jl v0.6.3`).

For more detailed explanation of these settings, please go to
[its official docs](https://domluna.github.io/JuliaFormatter.jl/stable/).

## Suggestion

It is recommended to use this extension with the [Format in context
menus](https://marketplace.visualstudio.com/items?itemName=lacroixdavid1.vscode-format-context-menu)
extension (not an ad!). It allows formatting multiple files at a time.

If you want to use this extension instead of the Julia extension to format your file, you
may want to put
```json
"[julia]": {
    "editor.defaultFormatter": "singularitti.vscode-julia-formatter"
},
```
in the editor's `settings.json`.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for release notes.
