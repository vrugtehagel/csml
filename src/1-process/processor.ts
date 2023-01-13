import { errors } from '../index.ts'

import Reader from './reader.ts'
import definitions from './definitions.ts'


export default class Processor {
	#reader: Reader
	#stack = []
	#cache: {name: string, content: any} = {}
	#isFile = true
	level = 0

	constructor(source){
		const replaceTabs = match => '\n' + ' '.repeat(match.length - 1)
		const normalized = `\n${source}\n`
			.replaceAll('\r\n', '\n')
			.replaceAll(/\n[\t ]+(?=\n)/g, '\n')
			.replaceAll(/\n[\t ]+/g, replaceTabs)
			.slice(1, -1)
		this.#reader = new Reader(normalized)
	}

	static process(source, type = 'all'){
		const processor = new Processor(source)
		if(type != 'all') processor.#isFile = false
		return processor.expect(type).get()
	}

	open(item = {}){
		this.#stack.push(item)
		return this
	}

	peek(){
		if(this.#stack.length == 0) return null
		return this.#stack.at(-1)
	}

	close(){
		return this.#stack.pop()
	}

	abort(){
		this.close()
	}

	write(content){
		const name = 'manual'
		this.#cache = {name, content}
		return this
	}

	#tryOne(name){
		const thing = definitions[name] ?? name
		let matches, content
		if(typeof thing == 'function') content = thing(this)
		else ({matches, content} = this.#reader.read(thing))
		if(matches === false) return false
		if(!matches && content == null) return false
		this.#cache = {name, content}
		return true
	}

	try(...names){
		for(const name of names) if(this.#tryOne(name)) return this
		this.#cache = {}
		return this
	}

	if(...names){
		this.try(...names)
		if(!this.matched()) return
		return this
	}

	expect(...names){
		this.try(...names)
		if(this.matched()) return this
		const humanizedNames = names
			.map(name => name.replaceAll(/[A-Z]+/g, ' $&').toLowerCase())
		const last = humanizedNames.pop()
		let value
		if(humanizedNames.length == 0) value = last
		else if(humanizedNames.length == 1)
			value = `either ${humanizedNames[0]} or ${last}`
		else value = `one of ${humanizedNames.join(', ')} or ${last}`
		const reader = this.#reader
		const isFile = this.#isFile
		errors.throw('expected-token', {value, reader, isFile})
	}

	matched(){
		return this.#cache.name
	}

	get(){
		return this.#cache.content
	}

	as(property){
		if(this.#stack.length == 0) return this
		if(!this.matched()) return this
		const item = this.peek()
		item[property] = this.get()
		return this
	}

	into(property){
		if(this.#stack.length == 0) return this
		if(!this.matched()) return this
		const item = this.peek()
		item[property] ??= []
		item[property].push(this.get())
		return this
	}

	merge(){
		if(this.#stack.length == 0) return this
		if(!this.matched()) return this
		const item = this.peek()
		Object.assign(item, this.get())
		return this
	}

}
