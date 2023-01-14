import { TransformContext } from '../types.ts'
import { config, Processor } from '../index.ts'


export default class Context implements TransformContext {
	#node
	#parents

	constructor(node){
		this.#node = node
		this.#parents = node.path
		this.#parents.pop()
	}

	hasParent(name){
		return this.#parents.some(node => node.data.tagName === name)
	}

	hasFlag(flag){
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		return this.#parents.some(node => name in node.data.flags)
	}

	getFlag(flag){
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		for(const node of this.#parents)
			if(name in node.data.flags) return node.data.flags[name]
		return null
	}
}
