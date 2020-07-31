# Change Log

All notable changes to the "vscode-julia-formatter" extension will be documented in this file.

## 0.0.1

- Initial release, with some very basic functions.

## 0.0.2

- Fix some critical bugs.

## 0.0.3

- Add 3 more properties: `compile`, `whitespace_typedefs` and `whitespace_ops_in_indices`
- Simplify code, should improve performance.

## 0.0.4

- Add progress hint (#2)
- Fix path resolution (#1)
- Update docs

## 0.0.6

- Fixes the whole thing not working on Windows
- Fixes automatic installation of JuliaFormatter
- Fixes settings for the extension not working at all

Thanks to @friggog in #10

## 0.1.0

- Update configs to the latest version
- Close #8

### 0.2.1

- Add option `annotateUntypedFieldsWithAny` introduced in `JuliaFormatter.jl v0.6.3`
- Fix a bug that `alwaysForIn` & `overwrite` do not work properly

### 0.2.2

- Fix [`alwaysForIn` not working #14](https://github.com/singularitti/vscode-julia-formatter/issues/14)
- Fix `progressBar` will still show even if formatting fails
