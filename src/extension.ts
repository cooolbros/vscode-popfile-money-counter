import { commands, EndOfLine, ExtensionContext, Position, TextEditor, TextEditorEdit, window } from "vscode";
import { countMoney } from "./money-counter";
import { formatTable } from "./v2/table";
import { InfiniteLoopError, VDF, VDFSyntaxError } from "./v2/vdf-money-counter";

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerTextEditorCommand("pop-file-money-counter.countMoney", (editor: TextEditor, edit: TextEditorEdit) => {
		try {
			const money = VDF.countMoney(editor.document.getText())
			const tableContents: string[][][] = []
			tableContents.push([["Wave", "Currency", "A+"]])

			let missionCurrency = 0
			let missionCurrencyAPlus = 0

			if (money.Waves) {
				const wavesSection: string[][] = []
				for (let i: number = 0; i < money.Waves.length; i++) {
					const waveCurrency = money.Waves[i].reduce((a: number, b: number) => a + b)
					const waveCurrencyAPlus = waveCurrency + 100
					missionCurrency += waveCurrency
					missionCurrencyAPlus += waveCurrencyAPlus
					wavesSection.push([`Wave ${i + 1}`, `${waveCurrency}`, `${waveCurrencyAPlus}`])
				}
				tableContents.push(wavesSection)
			}

			tableContents.push([["Total", `${missionCurrency}`, `${missionCurrencyAPlus}`]])

			const eol = editor.document.eol == EndOfLine.CRLF ? "\r\n" : "\n"
			edit.insert(new Position(editor.selection.start.line, 0), `//${eol}// Starting Currency: ${money.StartingCurrency ?? 0}${eol}//${eol}${formatTable(eol, ...tableContents)}//`)
		}
		catch (e: unknown) {

			if (e instanceof VDFSyntaxError) {
				window.showErrorMessage(e.toString())
			}
			else if (e instanceof InfiniteLoopError) {
				const out = window.createOutputChannel("Pop File Money Counter")
				out.appendLine(e.toString())
				out.show()
			}
			edit.insert(new Position(editor.selection.start.line, 0), countMoney(editor.document.getText(), editor.document.eol))
		}
	}))
}

export function deactivate() { }
