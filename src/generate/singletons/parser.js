import TextProcessor from '../classes/text-processor.js'
import tokenDefinitions from '../data/token-definitions.js'

export default new class Parser {
	#registry = {}

	constructor(){
		for(const [name, definition] of Object.entries(tokenDefinitions))
			this.#register(name.slice(1), ...definition)
	}

	#getParserForType(type, ...args){
		if(type == 'S') return this.getStringParser(...args)
		if(type == 'T') return this.getTextParser(...args)
		if(type == 'G') return this.getGrammarParser(...args)
		if(type == 'B') return this.getBranchParser(...args)
	}

	#register(name, type, ...args){
		this.#registry[name] = this.#getParserForType(type, ...args)
	}

	parse(name, processor, any){
		if(!any) return this.#registry[name](processor)
		const result = []
		let parsed
		while(parsed = this.parse(name, processor)) result.push(parsed)
		return result
	}

	getStringParser(shape){
		return processor => processor.processString(shape)
	}

	getTextParser(each, first){
		return processor => processor.processText(each, first)
	}

	getBranchParser(definition){
		const branches = definition.split(/,\s*/)
			.map(raw => [raw.replace(/_!?/, ''), raw.includes('!')])
		return processor => this.#parseBranches(processor, branches)
	}

	#parseBranches(processor, branches){
		for(const [branch, flatten] of branches){
			const result = this.parse(branch, processor)
			if(result) return flatten ? result : {branch, [branch]: result}
		}
		return null
	}

	getGrammarParser(definition){
		const parts = definition.match(/\s+|_[!?*+]*[a-z]+|[^\s_]+/gi)
			.map(match => this.#transformGrammarPart(match))
		const replacer = parts.findLast(part => part['!'])
		return processor => this.#parseGrammarParts(processor, parts, replacer)
	}

	#transformGrammarPart(match){
		if(match[0] == ' ') return {isWhitespace: true}
		if(match[0] != '_') return {isString: true, type: match}
		const [full, modifiers, type] = match.match(/^_([?!*+]*)([a-z]+)$/i)
		const result = {type}
		for(const modifier of modifiers) result[modifier] = true
		return result
	}

	#parseGrammarParts(processor, parts, replacer){
		const result = {}
		if(!this.#parseGrammarPart(processor, parts[0], result)) return null
		for(const part of parts.slice(1))
			if(!this.#parseGrammarPart(processor, part, result))
				throw Error(`Expected ${part.type}`)
		if(!replacer) return result
		return result[replacer.type]
	}

	#parseGrammarPart(processor, part, accumulator){
		if(part.isWhitespace) return processor.deleteWhitespace()
		if(part.isString) return processor.deleteString(part.type)
		const data = this.parse(part.type, processor, part['*'] || part['+'])
		if(part['+'] && data.length == 0) return false
		if(!part['?'] && !data) return false
		accumulator[part.type] = data
		return true
	}

}
