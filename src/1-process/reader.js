import { errors } from '../index.ts'

import Interpolation from './interpolation.ts'


export default class Reader {
	#source
	#data = ''

	constructor(source){
		this.#source = source
		this.#data = source
	}

	get source(){ return this.#source }
	get value(){ return this.#data }

	#read(amount){
		this.#data = this.#data.slice(amount)
	}

	readString(string){
		const matches = this.#data.startsWith(string)
		if(!matches) return {matches: false}
		this.#data = this.#data.slice(string.length)
		return {matches: true, content: string}
	}

	readRegex(regex){
		const match = this.#data.match(regex)
		if(!match) return {matches: false}
		const [content] = match
		this.#data = this.#data.slice(content.length)
		return {matches: true, content}
	}

	readInterpolable(regex){
		const content = new Interpolation
		while(true){
			const openIndex = this.#data.indexOf('{{')
			const match = this.#data.slice(0, openIndex).match(regex)
			if(!match) return errors.throw('never')
			content.addString(match[0])
			this.#data = this.#data.slice(match[0].length)
			if(openIndex != match[0].length) break
			const closeIndex = this.#data.indexOf('}}')
			if(closeIndex == -1)
				errors.throw('unended-interpolation', {reader: this})
			const value = this.#data.slice(2, closeIndex)
			this.#data = this.#data.slice(closeIndex + 2)
			content.addValue(value)
		}
		if(content.isEmpty) return {matches: false}
		return {matches: true, content}
	}

	read(thing){
		if(typeof thing == 'string') return this.readString(thing)
		if(!thing.interpolable) return this.readRegex(thing.regex)
		return this.readInterpolable(thing.regex)
	}

}
