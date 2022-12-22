import errors from '../../errors/index.js'

export default new class Config {
	#transforms = new Map
	#addingFlag = false

	preformattedTags = new Set
	preformattedFlags = new Set

	#validateName(name){
		if(/^[-\w]+$/.test(name)) return
		errors.throw('invalid-transform-name')
	}

	addFlag(name, callback, options = {}){
		this.#validateName(name)
		const transform = options.invert
			? (text, context) => !context.hasFlag(name) && callback(text)
			: (text, context) => context.hasFlag(name) && callback(text)
		this.#addingFlag = true
		if(this.#transforms.has(`flag:${name}`))
			errors.throw('thing-already-exists', {thing: 'flag', name})
		this.addTransform(`flag:${name}`, transform)
		this.#addingFlag = false
		if(options.preformatted) this.preformattedFlags.add(name)
	}

	removeFlag(name){
		this.preformattedFlags.delete(name)
		this.remove(`flag:${name}`)
	}

	addTransform(name, transform){
		if(!this.#addingFlag) this.#validateName(name)
		if(this.#transforms.has(name))
			errors.throw('thing-already-exists', {thing: 'transform', name})
		this.#transforms.set(name, transform)
	}

	removeTransform(name){
		this.#transforms.delete(name)
	}

	addPreformattedTag(name){
		this.preformattedTags.add(name)
	}

	removePreformattedTag(name){
		this.preformattedTags.delete(name)
	}	

	runTransforms(text, context){
		let result = text
		for(const [name, transform] of this.#transforms){
			const value = transform(result, context)
			if(typeof value == 'string') result = value
		}
		return result
	}

}
