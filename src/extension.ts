import * as vscode from "vscode"
import { Table } from "./table"

export function activate(context: vscode.ExtensionContext)
{
	let disposable = vscode.commands.registerCommand("pop-file-money-counter.countMoney", () =>
	{
		if (vscode.window.activeTextEditor)
		{
			const lines: string[] = vscode.window.activeTextEditor?.document.getText().split(/\r?\n/)

			let wave: number = 0, startingCurrency: number = 0, waveCurrency: number = 0, missionCurrency: number[] = []

			for (let i: number = 0; i < lines.length - 1; i++)
			{
				if (lines[i].includes("StartingCurrency") && wave == 0)
				{
					startingCurrency = parseInt(lines[i].split(/\s+/)[2])
				}
				if (/^wave$/i.test(lines[i].split(/\s+/)[1]) && lines[i + 1].includes("{"))
				{
					missionCurrency.push(waveCurrency)
					waveCurrency = 0
					wave++
				}
				if (lines[i].split(/\s+/)[1] === "TotalCurrency")
				{
					waveCurrency += parseInt(lines[i].split(/\s+/)[2])
				}
			}

			//push last wave because we wont see another 'wave' tag
			missionCurrency.push(waveCurrency)


			// Create Table
			let starting: string = `//\r\n// Starting Currency: ${startingCurrency}\r\n//\r\n`

			let table = new Table(3).setHeader(["Wave", "Currency", "A+"])

			for (let i: number = 0; i < missionCurrency.length - 1; i++)
			{
				table.addRow([`Wave ${i + 1}`, missionCurrency[i + 1], missionCurrency[i + 1] + 100])
			}

			const editor = vscode.window.activeTextEditor

			editor.edit((editBuilder: vscode.TextEditorEdit) =>
			{
				editBuilder.insert(new vscode.Position(editor.selection.start.line, 0), starting + table.getText())
			})
		}
		else
		{
			vscode.window.showErrorMessage("No active editor!")
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
