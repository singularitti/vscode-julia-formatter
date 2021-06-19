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

### 0.3.0

- Merge #19 & fixes #5, #12, #15, #16, no formatting does not cause losing changes
- Remove `juliaFormatter.overwrite` option since people almost always wanted to overwrite

### 0.4.0

- Merge #30 & #31: adding `BlueStyle` option

### 0.5.0

- Closes #32, merge #33: Add overwrite flags
- Merge #37: Add the latest formatting options

### 0.5.1

- Try to fix #28 "Formatter breaks code" in #40 "Fixed bug where formatting corrupted files, added option for Julia sys image, and cleaned up code."
- Merge #42: Add back args that was removed in PR #40

### 0.5.2

- Merge #44: Fixed bug where formatting twice in quick succession would cause duplicate "Formatting..." status bar items

### 0.6.0

- Merge #45: Simplified error message when file contains syntax errors

### 0.6.1

- Merge #46 & #47: Hotfix where multiple statements outside a module would cause formatting to fail

### 0.6.2

- Merge #48: Better error messages when file doesn't parse
