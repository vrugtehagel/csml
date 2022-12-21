import Context from '../classes/context.js'
import htmlBuilder from '../singletons/html-builder.js'
import string from '../tags/string.js'
import text from '../tags/text.js'

export default class CSMLCore {
	#tainted = false
	#transforms = new Set
	#open = []
	#context = new Context(this.#open)
	#csml
	#output = ''
	#shared
	#promises = {}

	constructor(csml, shared){
		this.#csml = csml
		this.#shared = shared
	}

	write(level, ...elements){
		const content = typeof elements.at(-1) == 'string'
			? elements.pop()
			: ''
		this.#removeOpenUntil(level)
		for(const element of elements) this.#addOpen(level, element)
		if(!content) return
		if(this.#promises[content]){
			this.#output += content
			this.#promises[content].context = new Context([...this.#open])
		}
		else this.#output += this.#applyTransforms(content)
	}

	#addOpen(level, element){
		this.#output += htmlBuilder.getOpeningTag(element)
		const output = htmlBuilder.getClosingTag(element)
		this.#open.unshift({level, element, output})
	}

	#removeOpenUntil(level){
		while(level <= this.#open[0]?.level)
			this.#output += this.#open.shift().output
	}

	#applyTransforms(text, context = this.#context){
		const {transforms} = this.#shared
		let result = text
		for(const [name, transform] of transforms){
			const transformed = transform(result, context)
			result = typeof transformed == 'string' ? transformed : result
		}
		return result
	}

	taint(){
		this.#tainted = true
	}

	async finalize(){
		const promises = Object.values(this.#promises)
			.map(({promise}) => promise)
		await Promise.all(promises)
		this.#removeOpenUntil(0)
	}

	getHTML(){
		if(this.#tainted) return ''
		return this.#output
	}

	#promiseTag(tag, parts, ...subs){
		if(!subs.some(sub => typeof sub?.then == 'function'))
			return tag(parts, ...subs)
		const uuid = crypto.randomUUID()
		const promise = Promise.all(subs).then(subs => {
			const newSubs = subs.map((sub, index) => {
				if(sub[Symbol.toStringTag] != 'Module') return sub
				if('default' in sub) return sub.default
				return sub
			})
			const content = tag(parts, ...newSubs)
			const {context} = this.#promises[uuid]
			const transformed = this.#applyTransforms(content, context)
			this.#output = this.#output.replace(uuid, transformed)
		})
		if(this.#promises[uuid]) throw Error('UUID not unique')
		this.#promises[uuid] = {promise}
		return uuid
	}

	text(parts, ...subs){
		return this.#promiseTag(text, parts, ...subs)
	}

	string(parts, ...subs){
		return this.#promiseTag(string, parts, ...subs)
	}

	attrValue(parts, ...subs){
		if(parts.length == 2 && parts[0] == '' && parts[1] == '')
			if(subs[0] == null) return null
		return this.string(parts, ...subs)
	}

}
