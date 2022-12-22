import CSML from './build/index.js'
import Context from './build/classes/context.js'

/**
 * Renders a CSML module.
 * @param url An absolute URL to a CSML module.
 * @param args An argument to pass to the CSML module The module will be able to access this argument through `csml.args`.
 * @returns The output HTML.
 */
export function render(url: URL | string, args: any): string {
	return CSML.render(url, args)
}


type Transform = (text: string, context: Context) => string | any;
/**
 * Adds a transform to run over text nodes.
 * @param name The (unique) name of the transform.
 * @param transform The callback to run over pieces of text. If the return value of the callback is a string, then the text node will be replaced by it; otherwise, the text remains unchanged.
 */
export function addTransform(name: string, transform: Transform): void {
	return CSML.addTransform(name, transform)
}

/**
 * Removes a transform.
 * @param name The name of the transform to remove.
 */
export function removeTransform(name: string): void {
	return CSML.removeTransform(name)
}
