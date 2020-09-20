export class Table
{
	header: string[]
	columns: number
	rows: any[][]

	constructor(columns: number)
	{
		this.header = []
		this.columns = columns
		this.rows = []
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
		console.log("adding row", data)
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
	getText(): string
	{
		if (this.header.length === 0)
		{
			return "No Header! please add header to table"
		}
		let len: number = this.header.reduce((total, current) => Math.max(total, current.length), 0)

		for (let i: number = 0; i < this.rows.length - 1; i++)
		{
			for (let j: number = 0; j < this.rows[i].length - 1; j++)
			{
				len = Math.max(this.rows[i][j].toString().length, len)
			}
		}

		let str: string = "", border: string = new Array(this.columns).fill("-".repeat(len + 2)).join("+")

		str += `// +${border}+\r\n// |`
		for (let i: number = 0; i < this.header.length; i++)
		{
			if (i === 0)	// Text Align Left
			{
				str += ` ${" ".repeat(len - this.header[i].toString().length)}${this.header[i]} |`
			}
			else	// Text Align Right
			{
				str += ` ${this.header[i]}${" ".repeat(len - this.header[i].toString().length)} |`
			}
		}
		str += `\r\n// +${border}+`

		for (const row of this.rows)
		{
			str += `\r\n// |`
			for (let i: number = 0; i < row.length; i++)
			{
				if (i === 0)	// Text Align Left
				{
					str += ` ${" ".repeat(len - row[i].toString().length)}${row[i]} |`
				}
				else	// Text Align Right
				{
					str += ` ${row[i]}${" ".repeat(len - row[i].toString().length)} |`
				}
			}
		}
		str += `\r\n// +${border}+\r\n//\r\n`
		return str
	}
}
