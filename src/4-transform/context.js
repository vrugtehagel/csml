import { config, Processor } from '../index.js'


export default class Context {
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
		return this.#parents.some(node => {
			return name in node.data.flags
				|| config.doesTagHaveFlag(node.data.tagName, name)
		})
	}

	getFlag(flag){
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		for(const node of this.#parents){
			if(name in node.data.flags)
				return node.data.flags[name]
			if(config.doesTagHaveFlag(node.data.tagName, name))
				return config.getFlagFromTag(node.data.tagName, name)
		}
		return null
	}
}
