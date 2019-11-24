'use strict';

import * as vscode from "vscode";
import * as util from "util";
import * as cp from "child_process";

export const promiseExec = util.promisify(cp.exec);
export let registration: vscode.Disposable | undefined;

export async function getJulia(): Promise<string> {
	// From https://github.com/julia-vscode/julia-vscode/blob/dd94db5/src/settings.ts#L8-L14
	let section = vscode.workspace.getConfiguration('julia');
	let jlpath = section ? section.get<string>('executablePath', null) : null;
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

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L78-L90
export async function installDocformatter(): Promise<void> {
	const julia = await getJulia();
	try {
		await promiseExec(`${julia} install.jl`);
	} catch (err) {
		vscode.window.showErrorMessage(`
		Could not install JuliaFormatter automatically. Make sure that it
		is installed correctly and try manually installing with 
		'julia -e 'using Pkg; Pkg.add("JuliaFormatter")'. \n\n Full error: ${err}'.
	  `);
		throw err;
	}
}

// From https://github.com/iansan5653/vscode-format-python-docstrings/blob/0135de8/src/extension.ts#L101-L132
export async function alertFormattingError(
	err: FormatException
): Promise<void> {
	if (
		err.message.includes("Package JuliaFormatter not found")
	) {
		const installButton = "Install Module";
		const response = await vscode.window.showErrorMessage(
			`The Julia package 'JuliaFormatter' must be installed to format
			docstrings.`,
			installButton
		);
		if (response === installButton) {
			installDocformatter();
		}
	} else {
		const bugReportButton = "Submit Bug Report";
		const response = await vscode.window.showErrorMessage(
			`Unknown Error: Could not format docstrings. Full error:\n\n
		  ${err.message}`,
			bugReportButton
		);
		if (response === bugReportButton) {
			vscode.commands.executeCommand(
				"vscode.open",
				vscode.Uri.parse(
					"https://github.com/singularitti/vscode-julia-formatter/issues/new"
				)
			);
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDocumentFormattingEditProvider('foo-lang', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const firstLine = document.lineAt(0);
			if (firstLine.text !== '42') {
				return [vscode.TextEdit.insert(firstLine.range.start, '42\n')];
			}
		}
	});
}

export interface FormatException {
	message: string;
}

// this method is called when your extension is deactivated
export function deactivate() { }
