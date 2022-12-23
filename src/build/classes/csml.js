import generate from '../../generate/index.js'

import CSMLCore from '../classes/csml-core.js'
import createProxyWrapper from '../functions/create-proxy-wrapper.js'
import maskSecret from '../functions/mask-secret.js'

export default class CSML {
	static #availableId = 1
	static #map = {}
	static async #render(url, args){
		const id = CSML.#availableId++
		CSML.#map[id] = {args}
		const content = await Deno.readTextFile(url)
		const code = generate(content, {csmlArgs: [id]})
		const jsURL = new URL(`${url}.${id}.js`)
		await Deno.writeTextFile(jsURL, code, {createNew: true})
		try {
			const imported = await import(jsURL)
			return imported
		} finally {
			await Deno.remove(jsURL)
		}
	}

	static async import(url, args){
		return await this.#render(url, args)
	}

	static async render(url, args){
		return (await this.#render(url, args)).default
	}

	#meta
	#shared = {
		id: -1,
		map: CSML.#map,
		transforms: CSML.#transforms
	}

	constructor(secret, meta, id){
		if(!CSML.#map[id] || CSML.#map[id].csml)
			throw TypeError('Illegal constructor')
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
