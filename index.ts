import CSML from './build/index.js'
import Context from './build/classes/context.js'

/**
 * Renders a CSML module.
 * @param {URL | string} url
 * 	An absolute URL to a CSML module.
 * @param {any} args
 * 	An argument to pass to the CSML module The module will be able to access
 *  this argument through `csml.args`.
 * @returns {string}
 * 	The output HTML.
 */
export const render = (url, args): string =>
	CSML.render(url, args)


type Transform = (text: string, context: Context) => string | any;
/**
 * Adds a transform to run over text nodes.
 * @param {string} name
 * 	The (unique) name of the transform.
 * @param {Transform} transform
 * 	The callback to run over pieces of text. If the return value of the
 * 	callback is a string, then the text node will be replaced by it; otherwise,
 *  the text remains unchanged.
 */
export const addTransform = (name: string, transform: Transform): void =>
	CSML.addTransform(name, transform)

/**
 * Removes a transform.
 * @param {string} name
 *  The name of the transform to remove.
 */
export const removeTransform = (name: string): void =>
	CSML.removeTransform(name)
