import Text from '../classes/text.js'

import errors from '../../errors/index.js'

export default class TextProcessor {
	static #templateEscapeRegex = /[`$]/g
	static escape(string){
		const escaped = string.replaceAll(this.#templateEscapeRegex, '\\$&')
		if(escaped.at(-1) != '\\') return escaped
		return escaped.replace(/(\\+)$/, '${$1$1}')
	}
	static #anyCharacter = /[^]/
	static toUserText(string){
		if(!string) return ''
		const processor = new TextProcessor(string)
		const text = processor.#text
		let result = ''
		while(!processor.done){
			text.select()
			text.moveTo('{{')
			text.cut()
			result += TextProcessor.escape(text.clipboard)
			if(text.length == 0) break
			result += processor.processInterpolation()
		}
		return result
	}

	#text

	constructor(text){
		this.#text = typeof text == 'string' ? new Text(text) : text
	}

	get current(){ return this.#text.current }
	get done(){ return this.#text.length == 0 }

	toString(){ return this.#text.toString() }

	processIndentation(){
		let level = 0
		this.#text.select()
		while(true){
			if(this.#text.current == '\t') level += 4
			else if(this.#text.current == ' ') level += 1
			else break
			this.#text.read(1)
		}
		this.#text.delete()
		return level
	}

	processInterpolation(){
		this.#text.select()
		const matched = this.#text.moveTo('}}')
		if(this.#text.selected.includes('{{', 2))
			errors.throw('unexpected', {type: 'token', thing: '{{'})
		if(!matched)
			errors.throw('expected', {type: 'token', thing: '}}'})
		this.#text.read(2)
		this.#text.cut()
		return '$' + this.#text.clipboard.slice(1, -1)
	}

	processString(shape){
		this.#text.select()
		this.#text.readWhile(shape)
		this.#text.cut()
		return this.#text.clipboard
	}

	processText(shape, firstShape){
		if(firstShape) return this.processComplexText(shape, firstShape)
		return this.processSimpleText(shape)
	}

	processSimpleText(shape){
		let result = ''
		this.#text.select()
		while(true){
			if(this.#text.current == '\\') this.#text.read(2)
			else if(this.#text.current == '{'){
				if(this.#text.next == '{'){
					this.#text.cut()
					result += TextProcessor.escape(this.#text.clipboard)
					result += this.processInterpolation()
					this.#text.select()
				} else this.#text.read(1)
			} else if(shape.test(this.#text.current)) this.#text.read(1)
			else break
		}
		this.#text.cut()
		result += TextProcessor.escape(this.#text.clipboard)
		return result
	}

	processComplexText(shape, firstShape){
		if(firstShape.test(this.#text.current))
			return this.processAmount(1) + this.processSimpleText(shape)
		if(this.#text.startsWith('{{')) return this.processSimpleText(shape)
		return ''
	}

	processAmount(amount){
		this.#text.select()
		this.#text.read(amount)
		this.#text.cut()
		return TextProcessor.escape(this.#text.clipboard)
	}

	deleteWhitespace(){
		this.#text.select()
		while(this.#text.current == ' ' || this.#text.current == '\t')
			this.#text.read(1)
		this.#text.delete()
		return true
	}

	deleteAmount(amount){
		this.#text.select()
		this.#text.read(amount)
		this.#text.delete()
		return true
	}

	deleteString(string){
		if(!this.#text.startsWith(string)) return false
		this.deleteAmount(string.length)
		return true
	}

}
