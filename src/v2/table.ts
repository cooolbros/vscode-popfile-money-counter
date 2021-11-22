export function formatTable(eol: "\r\n" | "\n", ...sections: string[][][]): string {
	let str: string = ""
	const longestKeyLength: number = sections.reduce((a, b) => Math.max(a, b.reduce((c, d) => Math.max(c, d.reduce((e, f) => Math.max(e, f.length), 0)), 0)), 0)
	const sectionDivider = `// ${`+${"-".repeat(longestKeyLength + 2)}`.repeat(sections[0][0].length)}+${eol}`
	for (const section of sections) {
		str += sectionDivider
		for (const column of section) {
			str += `// `
			for (const row of column) {
				str += `| ${row} ${" ".repeat(longestKeyLength - row.length)}`
			}
			str += `|${eol}`
		}
	}
	str += sectionDivider
	return str
}