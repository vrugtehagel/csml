import { csml } from './src/index.ts'


export const csmlAPI = {
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
	import(url: URL | string, args?: any): Promise<Module> {
		return csml.import(url, args)
	},

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
	render(url: URL | string, args?: any): Promise<string> {
		return csml.render(url, args)
	}
}
