export default class Context {
	#open

	constructor(open){
		this.#open = open
	}

	hasFlag(flagName){
		return this.#open.some(({element}) => flagName in element.flags)
	}

	getFlag(flagName){
		return this.#open.find(({element}) => flagName in element.flags)
			?.flags[flagName] ?? ''
	}

	hasParent(tagName){
		if(!tagName) return false
		return this.#open.some(({element}) => element.tagName == tagName)
	}

	isDirectChildOf(tagName){
		if(!tagName) return false
		return this.#open[0].element.tagName == tagName
	}

}
