"use strict";

import * as vscode from "vscode";
import * as util from "util";
import * as cp from "child_process";
import * as diff from "diff";
import untildify = require("untildify");
import { streamWrite, streamEnd, readableToString } from "@rauschma/stringio";
import { onExit } from "./on-exit";

export const promiseExec = util.promisify(cp.exec);
export let registration: vscode.Disposable | undefined;

let progressBar: vscode.StatusBarItem;

let outputChannel = vscode.window.createOutputChannel("Julia Formatter");
outputChannel.show();
outputChannel.appendLine("Initializing Julia Formatter extension");

export async function getJulia(): Promise<string> {
	// From https://github.com/julia-vscode/julia-vscode/blob/dd94db5/src/settings.ts#L8-L14
	let section = vscode.workspace.getConfiguration("julia");
	let jlpath = section
		? untildify(section.get<string>("executablePath", "julia"))
		: null;
	if (jlpath === "") {
		jlpath = null;
	}
	// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L15-L45
	if (jlpath !== null) {
		try {
			await promiseExec(`"${jlpath}" --version`);
			return jlpath;
		} catch (err) {
			vscode.window.showErrorMessage(`
		  The Julia path set in the "julia.executablePath" setting is invalid. Check
		  the value or clear the setting to use the global Julia installation.
		`);
			throw err;
		}
	}
	try {
		await promiseExec("julia --version");
		return "julia";
	} catch {
		try {
			await promiseExec("jl --version");
			return "jl";
		} catch (err) {
			vscode.window.showErrorMessage(`
		  Julia is either not installed or not properly configured. Check that
		  the Julia location is set in VSCode or provided in the system
		  environment variables.
		`);
			throw err;
		}
	}
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L54-L72
export async function buildFormatArgs(): Promise<string[]> {
	const settings = vscode.workspace.getConfiguration("juliaFormatter");

	const overwriteFlags = settings.get<boolean>("overwriteFlags") as boolean;
	const compile = settings.get<string>("compile") as string;
	const margin = settings.get<number>("margin") as number;
	const indent = settings.get<number>("indent") as number;

	const formattingFlagsKeyMap = {
		alwaysForIn: "always_for_in",
		whitespaceTypedefs: "whitespace_typedefs",
		whitespaceOpsInIndices: "whitespace_ops_in_indices",
		removeExtraNewlines: "remove_extra_newlines",
		importToUsing: "import_to_using",
		pipeToFunctionCall: "pipe_to_function_call",
		shortToLongFunctionDef: "short_to_long_function_def",
		alwaysUseReturn: "always_use_return",
		whitespaceInKwargs: "whitespace_in_kwargs",
		annotateUntypedFieldsWithAny: "annotate_untyped_fields_with_any",
		formatDocstrings: "format_docstrings",
		alignAssignment: "align_assignment",
		alignStructField: "align_struct_field",
		alignConditional: "align_conditional",
		alignPairArrow: "align_pair_arrow",
	};

	let style: string;
	switch (settings.get<string>("style")) {
		case "yas":
			style = "YASStyle()";
			break;
		case "blue":
			style = "BlueStyle()";
			break;
		default:
			style = "DefaultStyle()";
			break;
	}
	const optionsList = [
		`style = ${style}`,
		`indent = ${indent}`,
		`margin = ${margin}`,
		...(overwriteFlags
			? Object.entries(formattingFlagsKeyMap).map(([jsKey, juliaKwarg]) => {
					// All flags have defaults set in package.json, so this can't return undefined
					const value = settings.get<boolean>(jsKey) as boolean;

					// JS and Julia use the same representation for `true` and `false`
					return `${juliaKwarg}=${value}`;
			  })
			: []),
	];

	// Remove extra whitespace (helps with tests)
	const options = optionsList.join(",").trim().replace(/\s+/, " ");

	const sysimagePath = settings.get<string>("sysimagePath") as string;
	const systemImageArgs = sysimagePath.length > 0 ? ["--sysimage", sysimagePath] : [];

	const cmdArgs = [
		`--compile=${compile}`,
		...systemImageArgs,
		"-e",
		`using JuliaFormatter

		function format_stdin()
			print(format_text(String(read(stdin)); ${options}))
		end

		format_stdin()
		`,
	];

	outputChannel.appendLine(`Running Julia with args: ${JSON.stringify(cmdArgs)}`);

	return cmdArgs;
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L78-L90
export async function installDocformatter(): Promise<void> {
	const julia = await getJulia();
	try {
		await promiseExec(
			`${julia} -e "using Pkg; Pkg.update(); Pkg.add(\\\"JuliaFormatter\\\")"`,
		);
	} catch (err) {
		vscode.window.showErrorMessage(`
		Could not install JuliaFormatter automatically. Make sure that it
		is installed correctly and try manually installing with
		'julia -e \"using Pkg; Pkg.add(\\\"JuliaFormatter\\\")\". \n\n Full error: ${err}'.
	  `);
		throw err;
	}
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L101-L132
export async function alertFormattingError(err: FormatException): Promise<void> {
	if (err.message.includes("Package JuliaFormatter not found")) {
		const installButton = "Install Module";
		const response = await vscode.window.showErrorMessage(
			`The Julia package 'JuliaFormatter' must be installed to format files.`,
			installButton,
		);
		if (response === installButton) {
			installDocformatter();
		}
	} else {
		const bugReportButton = "Submit Bug Report";
		const response = await vscode.window.showErrorMessage(
			`Unknown Error: Could not format file. Full error:\n\n
		  ${err.message}`,
			bugReportButton,
		);
		if (response === bugReportButton) {
			vscode.commands.executeCommand(
				"vscode.open",
				vscode.Uri.parse(
					"https://github.com/singularitti/vscode-julia-formatter/issues/new",
				),
			);
		}
	}
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L142-L152
export async function format(path: string, content: string): Promise<diff.Hunk[]> {
	const julia = await getJulia();
	const args: string[] = await buildFormatArgs();
	try {
		progressBar = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			-1,
		);
		progressBar.text = "Formatting...";
		progressBar.show();
		const juliaFormatter = cp.spawn(julia, args);

		await streamWrite(juliaFormatter.stdin, content);
		await streamEnd(juliaFormatter.stdin);

		const formattedContent = await readableToString(juliaFormatter.stdout);

		// TODO: capture stderr output from JuliaFormatter on error
		await onExit(juliaFormatter);

		// It would be nicer if we could combine these two lines somehow
		const patch = diff.createPatch(path, content, formattedContent);
		const parsed: diff.ParsedDiff[] = diff.parsePatch(patch);
		return parsed[0].hunks;
	} catch (err) {
		alertFormattingError(err);
		throw err;
	} finally {
		progressBar.dispose();
	}
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L159-L180
export function hunksToEdits(hunks: diff.Hunk[]): vscode.TextEdit[] {
	return hunks.map((hunk): vscode.TextEdit => {
		const nLines = hunk.lines.length;
		const startPos = new vscode.Position(hunk.oldStart - 1, 0);
		const endPos = new vscode.Position(
			hunk.oldStart - 1 + hunk.oldLines - 1,
			hunk.lines[nLines - 1].length,
		);
		const editRange = new vscode.Range(startPos, endPos);

		const newTextLines = hunk.lines
			.map((line, index) =>
				index < nLines - 1 ? line.concat(hunk.linedelimiters[index]) : line,
			)
			.filter((line): boolean => line.charAt(0) === " " || line.charAt(0) === "+")
			.map((line): string => line.substr(1));
		const newText = newTextLines.join("");

		return vscode.TextEdit.replace(editRange, newText);
	});
}

export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDocumentFormattingEditProvider("julia", {
		provideDocumentFormattingEdits(
			document: vscode.TextDocument,
		): Promise<vscode.TextEdit[]> {
			return format(document.fileName, document.getText()).then(hunksToEdits);
		},
	});
}

export interface FormatException {
	message: string;
}

// this method is called when your extension is deactivated
export function deactivate(): void {
	if (registration) {
		registration.dispose();
	}
}
