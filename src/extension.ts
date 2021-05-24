import * as vscode from "vscode";
import { Table } from "./table";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand("pop-file-money-counter.countMoney", (editor: vscode.TextEditor, edit) => {

		const document = editor.document
		const eol = document.eol == 2 ? "\r\n" : "\n"
		const lines: string[] = document.getText().split(eol)

		let wave: number = 0
		let wave0: boolean = true
		let startingCurrency: number = 0
		let waveCurrency: number = 0
		let missionCurrency: number[] = []

		for (let i: number = 0; i < lines.length; i++) {
			if (wave0) {
				if (lines[i].includes("StartingCurrency")) {
					startingCurrency = parseInt(lines[i].split(/\s+/)[2])
					wave0 = false;
				}
			}
			// Add money to current wave
			if (lines[i].split(/\s+/)[1] === "TotalCurrency") {
				waveCurrency += parseInt(lines[i].split(/\s+/)[2])
			}
			// Create new wave
			if (/^wave$/i.test(lines[i].split(/\s+/)[1]) && lines[i + 1].includes("{")) {
				missionCurrency.push(waveCurrency)
				waveCurrency = 0
				wave++
			}
		}

		// Push last wave because we wont see another 'wave' tag
		missionCurrency.push(waveCurrency)

		// Create Table
		let starting: string = `//${eol}// Starting Currency: ${startingCurrency}${eol}//`
		let total = 0, totalBonus = 0

		const table = new Table(3).setHeader(["Wave", "Currency", "A+"])

		// Start at 1 because the first wave creation pushes the initial
		// waveCurrency to the missionCurrency array
		for (let i: number = 1; i < missionCurrency.length; i++) {
			total += missionCurrency[i]
			totalBonus += missionCurrency[i] + 100
			table.addRow([`Wave ${i}`, `${missionCurrency[i]}`, `${missionCurrency[i] + 100}`])
		}
		table.setFooter(["Total", `${total}`, `${totalBonus}`])

		edit.insert(new vscode.Position(editor.selection.start.line, 0), starting + table.getText(eol))

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
