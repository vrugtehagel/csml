import CSMLCore from '../classes/csml-core.js'
import createProxyWrapper from '../functions/create-proxy-wrapper.js'
import maskSecret from '../functions/mask-secret.js'

import generate from '../../generate/index.js'
import errors from '../../errors/index.js'


export default class CSML {
	static #availableId = 1
	static #map = {}
	static writeOptions = {create: true}
	static async #render(url, args){
		const id = CSML.#availableId++
		CSML.#map[id] = {args}
		const content = await Deno.readTextFile(url)
		const code = generate(content, url, {csmlArgs: [id]})
		const jsURL = new URL(`${url}.${id}.js`)
		await Deno.writeTextFile(jsURL, code, this.writeOptions)
		const controller = new AbortController
		const {signal} = controller
		const cleanup = async () => await Deno.remove(jsURL)
		window.addEventListener('unload', cleanup, {signal, once: true})
		const imported = await import(jsURL)
		controller.abort()
		await cleanup()
		return imported
	}

	static async import(url, args){
		return await this.#render(url, args)
	}

	static async render(url, args){
		return (await this.#render(url, args)).default
	}

	static async convert(url, args){
		const content = await this.render(url, args)
		const {href} = url
		const htmlURL = href.endsWith('.csml')
			? href.slice(-5) + '.html'
			: href + '.html'
		await Deno.writeTextFile(htmlURL, htmlURL, this.writeOptions)
	}

	#meta
	#shared = {
		id: -1,
		map: CSML.#map,
	}

	constructor(secret, meta, id){
		if(!CSML.#map[id] || CSML.#map[id].csml)
			errors.throw('illegal-constructor')
		CSML.#map[id].csml = this
		const core = new CSMLCore(this, this.#shared)
		this.#meta = meta
		this.#shared.id = id
		Object.defineProperty(this, secret, {value: core})
		maskSecret(this, secret, () => core.taint())
	}

	get args(){ return CSML.#map[this.#shared.id].args }

	async import(relativeURL, args){
		const url = new URL(relativeURL, this.#meta.url)
		return await CSML.#render(url, args)
	}

}
