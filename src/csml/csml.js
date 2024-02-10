import { Processor, Transpiler, errors } from '../index.js'
import { toFileUrl } from 'https://deno.land/std@0.185.0/path/mod.ts'

import manager from './manager.js'


export default class CSML {
	static #global
	#location
	#id
	#cache = new Map

	constructor(url){
		if(!url && CSML.#global) errors.throw('illegal-constructor')
		if(!url) return CSML.#global = this
		this.#location = new URL(url)
		const [match, id] = url.match(/(\d+)\.ts$/)
		this.#id = Number(id)
		manager.register(id, {csml: this})
	}

	get args(){ return manager.get(this.#id, 'args') }

	async #getModuleCode(url){
		if(this.#cache.has(url.href))
			return this.#cache.get(url.href)
		const content = await Deno.readTextFile(url)
		const tokens = Processor.process(content)
		const code = Transpiler.transpile(tokens)
		this.#cache.set(url.href, code)
		return code
	}

	async import(csmlModule, args){
		const url = this == CSML.#global
			? toFileUrl(await Deno.realPath(csmlModule))
			: new URL(csmlModule, this.#location)
		const code = await this.#getModuleCode(url)
		const id = manager.getNewId()
		manager.register(id, {args})
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
