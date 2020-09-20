export class Table
{
	header: string[]
	columns: number
	rows: any[][]
	footer: string[]

	constructor(columns: number)
	{
		this.header = []
		this.columns = columns
		this.rows = []
		this.footer = []
	}
	setHeader(data: any): Table
	{
		if (data.length === this.columns)
		{
			this.header = data
		}
		else
		{
			throw new RangeError()
		}
		return this
	}
	addRow(data: any): Table
	{
		if (data.length === this.columns)
		{
			this.rows.push(data)
		}
		else
		{
			throw new RangeError()
		}
		return this
	}
	setFooter(data: any): Table
	{
		if (data.length === this.columns)
		{
			this.footer = data
		}
		else
		{
			throw new RangeError()
		}
		return this
	}
	getText(): string
	{
		if (this.header.length === 0)
		{
			return "No Header! please add header to table"
		}

		// Calculate longest of all keys before adding rows (all table cells will be same width)

		// len initializes to the longest of the header elements, because
		// it has different formatting rules it's not included in
		// the rows array
		let len: number = this.header.reduce((total, current) => Math.max(total, current.toString().length), 0)


		// Evaluate all cells in rows
		for (let i: number = 0; i < this.rows.length - 1; i++)
		{
			for (let j: number = 0; j < this.rows[i].length - 1; j++)
			{
				len = Math.max(this.rows[i][j].toString().length, len)
			}
		}


		let hr: string = `\r\n// +${new Array(this.columns).fill("-".repeat(len + 2)).join("+")}+`
		let str: string = hr

		// Add Header cells
		str += `\r\n// |`
		for (let i: number = 0; i < this.header.length; i++)
		{
			str += ` ${this.header[i]}${" ".repeat(len - this.header[i].toString().length)} |`
		}
		str += hr

		// Add Rows
		for (const row of this.rows)
		{
			str += `\r\n// |`
			for (let i: number = 0; i < row.length; i++)
			{
				str += ` ${row[i]}${" ".repeat(len - row[i].toString().length)} |`
			}
		}

		// Add Footer
		str += hr
		str += `\r\n// |`
		for (const cell of this.footer)
		{
			str += ` ${cell}${" ".repeat(len - cell.toString().length)} |`
		}
		str += hr
		str += `\r\n//`

		return str
	}
}
