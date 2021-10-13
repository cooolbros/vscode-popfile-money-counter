import { EndOfLine } from "vscode"
import { Table } from "./table"

export function countMoney(str: string, eol: EndOfLine): string {
	const lines = str.split(/\r?\n/)

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
	const starting: string = `//${eol}// Starting Currency: ${startingCurrency}${eol}//`
	let total = 0, totalBonus = 0

	const table = new Table(3)
	table.setHeader(["Wave", "Currency", "A+"])

	// Start at 1 because the first wave creation pushes the initial
	// waveCurrency to the missionCurrency array
	for (let i: number = 1; i < missionCurrency.length; i++) {
		total += missionCurrency[i]
		totalBonus += missionCurrency[i] + 100
		table.addRow([`Wave ${i}`, `${missionCurrency[i]}`, `${missionCurrency[i] + 100}`])
	}
	table.setFooter(["Total", `${total}`, `${totalBonus}`])

	return starting + table.getText(eol)
}