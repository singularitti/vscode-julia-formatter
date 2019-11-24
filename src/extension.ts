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

// this method is called when your extension is deactivated
export function deactivate() { }
