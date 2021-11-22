import { Position, Range } from "vscode"
import keyLimit from "./key_limit.json"

interface VDFTokeniserOptions {
	allowMultilineStrings?: boolean
	osTags?: VDFOSTags
	returnComments?: boolean
}

enum VDFOSTags {
	None,
	Strings,
	Objects,
	All
}

class VDFTokeniser {
	private static readonly whiteSpaceIgnore: string[] = [" ", "\t", "\r", "\n"]
	private readonly str: string
	public readonly options: VDFTokeniserOptions
	public position: number = 0
	public line: number = 0
	public character: number = 0
	public quoted: 0 | 1 = 0
	constructor(str: string, options?: VDFTokeniserOptions) {
		this.str = str
		this.options = {
			allowMultilineStrings: options?.allowMultilineStrings ?? false,
			osTags: options?.osTags ?? VDFOSTags.All,
			returnComments: options?.returnComments ?? false
		}
	}
	next(lookAhead: boolean = false): string {
		let currentToken: string = ""
		let j: number = this.position
		let _line: number = this.line
		let _character: number = this.character
		let _quoted: 0 | 1 = this.quoted
		if (j >= this.str.length - 1) {
			return "EOF"
		}
		while ((VDFTokeniser.whiteSpaceIgnore.includes(this.str[j]) || this.str[j] == "/") && j <= this.str.length - 1) {
			if (this.str[j] == '\n') {
				_line++
				_character = 0
			}
			else {
				_character++
			}
			if (this.str[j] == '/') {
				if (this.str[j + 1] == '/') {
					while (this.str[j] != '\n') {
						j++
						// _character++
					}
				}
			}
			else {
				j++
				// _character++
			}
			if (j >= this.str.length) {
				return "EOF"
			}
		}
		if (this.str[j] == "\"") {
			// Read until next quote (ignore opening quote)
			_quoted = 1
			j++ // Skip over opening double quote
			_character++ // Skip over opening double quote
			while (this.str[j] != "\"" && j < this.str.length) {
				if (this.str[j] == '\n') {
					if (!this.options.allowMultilineStrings) {
						throw new VDFSyntaxError(
							`Unexpected EOL at position ${j} (line ${_line + 1}, position ${_character + 1})! Are you missing a closing double quote?`,
							new Range(
								new Position(_line, _character - currentToken.length),
								new Position(_line, _character)
							)
						)
					}
					else {
						_line++
						_character = 0
					}
				}
				if (this.str[j] == "\\") {
					// Add backslash
					currentToken += "\\"
					j++
					_character++

					// Add character
					currentToken += this.str[j]
					j++
					_character++
				}
				else {
					currentToken += this.str[j]
					j++
					_character++
				}
			}
			j++ // Skip over closing quote
			_character++ // Skip over closing quote
		}
		else {
			// Read until whitespace (or end of file)
			_quoted = 0
			while (!VDFTokeniser.whiteSpaceIgnore.includes(this.str[j]) && j < this.str.length) {
				if (this.str[j] == "\"") {
					throw new VDFSyntaxError(
						`Unexpected " at position ${j} (line ${this.line}, position ${this.character})! Are you missing terminating whitespace?`,
						new Range(
							new Position(_line, _character - currentToken.length),
							new Position(_line, _character)
						)
					)
				}
				if (this.str[j] == "\\") {
					// Add backslash
					currentToken += "\\"
					j++
					_character++

					// Add character
					currentToken += this.str[j]
					j++
					_character++
				}
				else {
					currentToken += this.str[j]
					j++
					_character++
				}
			}
		}
		if (!lookAhead) {
			this.position = j
			this.line = _line
			this.character = _character
			this.quoted = _quoted
		}
		return currentToken
	}
}

export class VDFSyntaxError extends Error {
	constructor(message: string, public range: Range) {
		super(message)
	}
}


export interface IMoney {
	StartingCurrency?: number
	Waves?: number[][]
}

export class InfiniteLoopError extends Error {
	constructor(functionName: string, missingToken: string, objectName: string) {
		super(`${functionName}: Could not find closing ${missingToken} for ${objectName}!`)
	}
}

export class VDF {
	static countMoney(str: string): IMoney {
		const tokeniser = new VDFTokeniser(str)
		const money: IMoney = {}
		const parseDocument = () => {
			let currentToken = tokeniser.next()
			let nextToken = tokeniser.next(true)
			let count = 0
			while (currentToken != "EOF" && count < 100) {
				if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
					tokeniser.next() // Skip OS Tag
					// Don't parseAny -- See below
				}
				// The first object in the document is the WaveSchedule regardless of it's name
				if (nextToken == "{") {
					tokeniser.next()
					money.Waves = parseWaveSchedule(currentToken)
					return
				}
				else {
					tokeniser.next()
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next()
					}
				}
				currentToken = tokeniser.next()
				nextToken = tokeniser.next(true)
				count++
			}
			if (count == keyLimit) {
				throw new InfiniteLoopError("parseDocument", "EOF", "document")
			}
		}
		const parseWaveSchedule = (name: string): number[][] => {
			const wavesMoney: number[][] = []
			let currentToken = tokeniser.next().toLowerCase()
			let nextToken = tokeniser.next(true)
			let count = 0
			while (currentToken != "}" && count < keyLimit) {
				if (currentToken == "startingcurrency") {
					money.StartingCurrency = parseInt(tokeniser.next())
				}
				else if (currentToken == "wave") {
					if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
						tokeniser.next()
					}
					tokeniser.next()
					wavesMoney.push(parseWave(currentToken))
				}
				else if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
					tokeniser.next() // Skip OS Tag
					tokeniser.next() // Skip {
					parseAny(currentToken)
				}
				else if (nextToken == "{") {
					// console.log(`Discarding ${currentToken} object`)
					tokeniser.next() // Skip {
					parseAny(currentToken)
				}
				else {
					tokeniser.next()
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next() // Skip OS Tag
					}
				}
				currentToken = tokeniser.next().toLowerCase()
				nextToken = tokeniser.next(true)
				count++
			}
			if (count == keyLimit) {
				throw new InfiniteLoopError("parseWaveSchedule", "}", name)
			}
			return wavesMoney
		}
		const parseWave = (name: string): number[] => {
			const waveSpawnsMoney: number[] = []
			let currentToken = tokeniser.next().toLowerCase()
			let nextToken = tokeniser.next(true)
			let count = 0
			while (currentToken != "}" && count < keyLimit) {
				if (currentToken == "wavespawn") {
					if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
						tokeniser.next() // Skip OS Tag
					}
					tokeniser.next() // Skip {
					waveSpawnsMoney.push(parseWaveSpawn(currentToken))
				}
				else if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
					tokeniser.next() // Skip OS Tag
					tokeniser.next() // Skip {
					parseAny(currentToken)
				}
				else if (nextToken == "{") {
					tokeniser.next()
					parseAny(currentToken)
				}
				else {
					tokeniser.next()
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next()
					}
				}
				currentToken = tokeniser.next().toLowerCase()
				nextToken = tokeniser.next(true)
				count++
			}
			if (count == keyLimit) {
				throw new InfiniteLoopError("parseWave", "}", name)
			}
			return waveSpawnsMoney
		}
		const parseWaveSpawn = (name: string): number => {
			let waveSpawnMoney = 0
			let currentToken = tokeniser.next().toLowerCase()
			let nextToken = tokeniser.next(true)
			let count = 0
			while (currentToken != "}" && count < keyLimit) {
				if (currentToken == "totalcurrency") {
					waveSpawnMoney = parseInt(tokeniser.next())
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next() // Skip OS Tag
					}
				}
				else if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
					tokeniser.next() // Skip OS Tag
					tokeniser.next() // Skip {
					parseAny(currentToken)
				}
				else if (nextToken == "{") {
					tokeniser.next()
					parseAny(currentToken)
				}
				else {
					tokeniser.next()
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next()
					}
				}
				currentToken = tokeniser.next().toLowerCase()
				nextToken = tokeniser.next(true)
				count++
			}
			if (count == keyLimit) {
				throw new InfiniteLoopError("parseWaveSpawn", "}", name)
			}
			return waveSpawnMoney
		}
		const parseAny = (name: string) => {
			let currentToken = tokeniser.next().toLowerCase()
			let nextToken = tokeniser.next(true)
			let count = 0
			while (currentToken != "}" && count < keyLimit) {
				if (nextToken.startsWith("[") && nextToken.endsWith("]")) {
					tokeniser.next() // Skip OS Tag
					tokeniser.next() // Skip {
					parseAny(currentToken)
				}
				else if (nextToken == "{") {
					tokeniser.next()
					parseAny(currentToken)
				}
				else {
					tokeniser.next()
					const lookAhead = tokeniser.next(true)
					if (lookAhead.startsWith("[") && lookAhead.endsWith("]")) {
						tokeniser.next()
					}
				}
				currentToken = tokeniser.next()
				nextToken = tokeniser.next(true)
				count++
			}
			if (count == keyLimit) {
				throw new InfiniteLoopError("parseAny", "}", name)
			}
		}
		parseDocument()
		return money
	}
}