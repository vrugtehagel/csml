import { errors, Processor } from '../index.js'

import setDefaults from './set-defaults.js'


export default new class Config {
	#items = []
	#textualFlags = new Set
	#textualTags = new Set
	#tags = {}

	addFlag(flag, transform, options = {}){
		if(!flag) errors.throw('no-empty-transform-name')
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		if(this.flagExists(name)) errors.throw('flag-already-exists', {name})
		const callback = options.invert
			? (...args) => !args[1].hasFlag(name) && transform(...args)
			: (...args) => args[1].hasFlag(name) && transform(...args)
		this.#items.push({flag: name, callback})
		if(options.preformatted) this.#textualFlags.add(name)
		this.#resetTextualTags()
	}

	removeFlag(flag){
		if(!flag) return
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		const index = this.#items.findIndex(item => item.flag == name)
		if(index == -1) return
		this.#items.splice(index, 1)
		this.#resetTextualTags()
	}	

	addTransform(name, transform){
		if(!name) errors.throw('no-empty-transform-name')
		name = name.toString()
		if(this.transformExists(name))
			errors.throw('transform-already-exists', {name})
		const callback = transform
		this.#items.push({name, callback})
	}

	removeTransform(name){
		if(!name) return
		const index = this.#items.findIndex(item => item.name == name)
		if(index == -1) return
		this.#items.splice(index, 1)
	}

	addFlagToTag(tagName, flag){
		if(!flag) arrors.throw('no-empty-transform-name')
		this.#tags[tagName] ??= {}
		const token = Processor.process(flag.toString(), 'simpleFlag')
		this.#tags[tagName][token.name] = token.arguments
		this.#resetTextualTags()
	}

	removeFlagFromTag(tagName, flag){
		if(!flag) arrors.throw('no-empty-transform-name')
		if(!this.#tags[tagName]) return
		const {name} = Processor.process(flag.toString(), 'simpleFlag')
		delete this.#tags[tagName][name]
		this.#resetTextualTags()
	}

	isTokenPreformatted(token){
		const {tagName, flags} = token
		if(this.#textualTags.has(tagName?.string)) return true
		if(!flags) return false
		return flags.some(({name}) => this.isFlagPreformatted(name.string))
	}

	isFlagPreformatted(name){
		return this.#textualFlags.has(name)
	}

	flagExists(name){
		return this.#items.some(item => item.flag == name)
	}

	transformExists(name){
		return this.#items.some(item => item.name == name)
	}

	#resetTextualTags(){
		this.#textualTags.clear()
		for(const [tagName, flags] of Object.entries(this.#tags))
			if(Object.keys(flags).some(flag => this.#textualFlags.has(flag)))
				this.#textualTags.add(tagName)
	}

	applyTransforms(text, context){
		let result = text
		for(const {callback} of this.#items){
			const value = callback(result, context)
			if(typeof value == 'string') result = value
		}
		return result
	}

	resetToDefaults(){
		this.#items = []
		this.#textualFlags.clear()
		this.#textualTags.clear()
		this.#tags = {}
		setDefaults()
	}

}
