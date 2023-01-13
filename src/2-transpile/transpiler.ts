import { errors } from '../index.ts'

import dictionary from './dictionary.ts'
import getHeader from './get-header.ts'
import getFooter from './get-footer.ts'

export default class Transpiler {
	#tokens = []
	#namespace = `__CSML_${crypto.randomUUID().slice(-6)}__`
	#index: number
	#open = []
	#header = getHeader(this.#namespace)
	#footer = getFooter(this.#namespace)

	constructor(tokens){
		this.#tokens = tokens
		this.#index = tokens.length - 1
	}

	get level(){ return this.#tokens[this.#index].level }
	get #result(){
		return this.#open.reverse().map(([level, child]) => child).join('')
	}

	call(name, ...args){
		const {level} = this
		return `${this.#namespace}.${name}(${level},${args.join(',')})\n`
	}

	tag(name, arg){
		if(arg == null) return 'null'
		return `${this.#namespace}.tags.${name}${arg}`
	}

	transpile(name, token, content){
		if(!dictionary[name]) errors.throw('never')
		return dictionary[name](this, token, content)
	}

	#transpileNext(){
		const children = []
		const level = this.level
		while(this.#open.at(-1)?.[0] > level) children.push(this.#open.pop()[1])
		const content = children.join('')
		const token = this.#tokens[this.#index]
		const name = Object.keys(token).find(key => key != 'level')
		const result = this.transpile(name, token[name], content)
		this.#open.push([level, result])
		this.#index--
	}

	static transpile(tokens){
		const transpiler = new Transpiler(tokens)
		while(transpiler.#index >= 0) transpiler.#transpileNext()
		const header = transpiler.#header
		const code = transpiler.#result
		const footer = transpiler.#footer
		return header + code + footer
	}	

}
