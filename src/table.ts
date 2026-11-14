export class Table {

	private header: string[]
	private readonly columns: number
	private readonly rows: string[][]
	private footer: string[]

	public constructor(columns: number) {
		this.header = []
		this.columns = columns
		this.rows = []
		this.footer = []
	}

	public setHeader(data: string[]): void {
		if (data.length === this.columns) {
			this.header = data
		}
		else {
			throw new RangeError()
		}
	}

	public addRow(data: string[]): void {
		if (data.length === this.columns) {
			this.rows.push(data)
		}
		else {
			throw new RangeError()
		}
	}

	public setFooter(data: string[]): void {
		if (data.length === this.columns) {
			this.footer = data
		}
		else {
			throw new RangeError()
		}
	}

	public getText(eol: string): string {

		// Calculate longest of all keys before adding rows (all table cells will be same width)

		// len initializes to the longest of the header elements, because
		// it has different formatting rules it's not included in
		// the rows array
		let len: number = this.header.reduce((total, current) => Math.max(total, current.length), 0)


		// Evaluate all cells in rows
		for (let i: number = 0; i < this.rows.length - 1; i++) {
			for (let j: number = 0; j < this.rows[i].length - 1; j++) {
				len = Math.max(this.rows[i][j].length, len)
			}
		}

		const hr: string = `${eol}// +${Array.from({ length: this.columns }).fill("-".repeat(len + 2)).join("+")}+`
		let str: string = hr

		// Add Header cells
		str += `${eol}// |`
		for (let i: number = 0; i < this.header.length; i++) {
			str += ` ${this.header[i]}${" ".repeat(len - this.header[i].length)} |`
		}
		str += hr

		// Add Rows
		for (const row of this.rows) {
			str += `${eol}// |`
			for (let i: number = 0; i < row.length; i++) {
				str += ` ${row[i]}${" ".repeat(len - row[i].length)} |`
			}
		}

		// Add Footer
		str += hr
		str += `${eol}// |`
		for (const cell of this.footer) {
			str += ` ${cell}${" ".repeat(len - cell.length)} |`
		}
		str += hr
		str += `${eol}//`

		return str
	}
}
