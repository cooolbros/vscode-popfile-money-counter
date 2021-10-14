import * as vscode from "vscode";
import { countMoney } from "./money-counter";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerTextEditorCommand("pop-file-money-counter.countMoney", (editor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
		edit.insert(new vscode.Position(editor.selection.start.line, 0), countMoney(editor.document.getText(), editor.document.eol))
	}));
}

export function deactivate() { }
