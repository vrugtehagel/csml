import { Processor, Transpiler } from '../index.ts'

import manager from './manager.ts'


export default class CSML {
	static #global: CSML
	#location: URL
	#id: number | undefined

	constructor(url){
		if(!url && CSML.#global) errors.throw('illegal-constructor')
		if(!url) return CSML.#global = this
		this.#location = new URL(url)
		const [match, id] = url.match(/(\d+)\.ts$/)
		this.#id = Number(id)
		manager.register(id, {csml: this})
	}

    /**
     * Retrieves the arguments passed to the current module.
     * 
     * If there are no arguments, or if it is used outside a module, this just
     * returns `undefined`.
     */
	get args(){ return manager.get(this.#id, 'args') }

    /**
     * Imports a CSML module, including the HTML and other exports.
     * 
     * @param url An absolute URL to a CSML module.
     * @param args An arguments object to pass to the CSML module. The module will
     *             be able to access this argument through `csml.args`. While it is
     *             recommended that this is an object, it is also possible to pass
     *             anything else here.
     * @returns A promise resolving to a `Module` object, including all exports
     *          from the CSML file. The HTML output is included as the default
     *          export.
     */
	async import(csmlModule, args){
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

    /**
     * Renders a CSML module.
     * 
     * @example
     * ```js
     * const url = new URL('./about-page.csml', import.meta.url)
     * const html = await render(url, {name: 'vrugtehagel'})
     * 
     * console.log(html) // "<!DOCTYPE html><html lang=en><meta charset=utf-8><..."
     * ```
     * 
     * @param url An absolute URL to a CSML module.
     * @param args An arguments object to pass to the CSML module. The module will
     *             be able to access this argument through `csml.args`. While it is
     *             recommended that this is an object, it is also possible to pass
     *             anything else here.
     * @returns A promise resolving to the output HTML.
     */
	async render(csmlModule, args){
		return (await this.import(csmlModule, args)).default
	}

}
