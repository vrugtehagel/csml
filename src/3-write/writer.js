import { errors } from '../index.js'

import TreeNode from './tree-node.js'
import tags from './tags.js'
import normalize from './normalize.js'


export default class Writer {
	static #resolveAll(thing){
		if(typeof thing != 'object') return
		if(thing == null) return
		const promises = Object.entries(thing)
			.filter(([key, value]) => typeof value?.then == 'function')
			.map(([key, promise]) => promise.then(value => thing[key] = value))
		const other = Object.entries(thing)
			.filter(([key, value]) => typeof value?.then != 'function')
			.map(([key, value]) => Writer.#resolveAll(value))
			.filter(result => result)
		if(promises.length == 0 && other.length == 0) return
		return Promise.all([...promises, ...other])
	}

	static setFinalizers(...finalizers){
		if(this.#finalizers) errors.throw('never')
		this.#finalizers = finalizers
	}

	static #finalizers

	#finalized = false
	#open = [[-1, new TreeNode]]
	#promises = []
	tags = tags

	get #topLevel(){ return this.#open.at(-1)[0] }
	get #top(){ return this.#open.at(-1)[1] }
	get #bottom(){ return this.#open[0][1] }

	doctype(level, doctype){
		this.level(level)
		const node = this.#createNode({doctype})
		this.#top.append(node)
	}

	level(level){
		if(this.#finalized) errors.throw('never')
		while(this.#topLevel >= level) this.#open.pop()
	}

	write(level, ...things){
		this.level(level)
		const hasText = typeof things.at(-1) == 'string'
			|| things.at(-1) == null
			|| typeof things.at(-1).then == 'function'
		const hasTextFlags = things.length == 2 && !('tagName' in things[0])
		const text = hasText ? things.pop() ?? '' : ''
		const textFlags = hasTextFlags ? things.pop() : {flags: []}
		const nodes = things.map(thing => this.#createNode(thing))
		nodes.unshift(this.#top)
		for(let index = 1; index < nodes.length; index++)
			nodes[index - 1].append(nodes[index])
		if(nodes.length > 1) this.#open.push([level, nodes.at(-1)])
		if(!hasText) return
		const textNode = this.#createNode({...textFlags, text})
		this.#top.append(textNode)
	}

	#createNode(data){
		const promise = Writer.#resolveAll(data)
		const node = new TreeNode(data)
		if(promise) this.#promises.push(promise.then(() => normalize(node)))
		else normalize(node)
		return node
	}

	async finalize(){
		this.#finalized = true
		await Promise.all(this.#promises)
		let result = this.#bottom
		for(const finalizer of Writer.#finalizers) result = finalizer(result)
		return result
	}

}
