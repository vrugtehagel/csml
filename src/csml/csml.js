import { Processor, Transpiler, errors } from '../index.js'

import manager from './manager.js'


export default class CSML {
	static #global
	#location
	#id

	constructor(url){
		if(!url && CSML.#global) errors.throw('illegal-constructor')
		if(!url) return CSML.#global = this
		this.#location = new URL(url)
		const [match, id] = url.match(/(\d+)\.ts$/)
		this.#id = Number(id)
		manager.register(id, {csml: this})
	}

	get args(){ return manager.get(this.#id, 'args') }

	async import(csmlModule, args){
		if(csmlModule[0] == '.' && !this.#id)
			errors.throw('relative-import-in-global-csml', {url: csmlModule})
		const url = this.#location
			? new URL(csmlModule, this.#location)
			: new URL(csmlModule)
		const id = manager.getNewId()
		manager.register(id, {args})
		const content = await Deno.readTextFile(url)
		const tokens = Processor.process(content)
		const code = Transpiler.transpile(tokens)
		const tsURL = new URL(`${url}.${id}.ts`)
		await Deno.writeTextFile(tsURL, code, {create: true})
		const controller = new AbortController
		const {signal} = controller
		const once = true
		const cleanup = async () => await Deno.remove(tsURL)
		window.addEventListener('unload', cleanup, {signal, once})
		const imported = await import(tsURL)
		controller.abort()
		await cleanup()
		return imported
	}

	async render(csmlModule, args){
		return (await this.import(csmlModule, args)).default
	}

}
