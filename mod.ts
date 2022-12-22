/**
 * The entry point for CSML's APIs.
 * 
 * @module
 */

import CSML from './build/index.js'
import Context from './build/classes/context.js'
import config from './config/index.js'

/** The callback used to define flags and other transforms. */
export type Transform = (text: string, context: Context) => string | any;

/** The type of the optional third argument to `addFlag`. */
export type FlagTransformOptions = {
    /**
     * When set to `true`, will only apply the transform if the flag is _not_
     * present. Otherwise, the transform is applied only when one of the text
     * node's parents has the given flag.
     * 
     * @default {false}
     */
    invert?: boolean;
    /**
     * When set to `true`, switches the parser into consuming all children as
     * plain text.
     * 
     * @default {false}
     */
    preformatted: boolean;
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
 *             anything else here,
 * @returns The output HTML.
 */
export function render(url: URL | string, args?: any): Promise<string> {
	return CSML.render(url, args)
}


/**
 * Adds a transform to run over text nodes.
 * 
 * @example
 * ```js
 * addTransform('badge', (text, context) => {
 *     if(context.hasParent('main'))
 *     return text.replaceAll(/\[\[(\w+)\]\]/g, '<span class="badge">$1</span>')
 * })
 * ```
 * 
 * @param name The (unique) name of the transform.
 * @param transform The callback to run over pieces of text. If the return
 *                  value of the callback is a string, then the text node will
 *                  be replaced by it; otherwise, the text remains unchanged.
 * 
 * @throws {TypeError} The name provided contains non-alphanumeric
 *                     characters other than a dash (-) or underscore (_).
 * @throws {TypeError} The transform under the given name already exists.
 */
export function addTransform(name: string, transform: Transform): void {
	config.addTransform(name, transform)
}

/**
 * Removes a transform. If the transform under the given name does not exist,
 * it does nothing.
 * @param name The name of the transform to remove.
 */
export function removeTransform(name: string): void {
    config.removeTransform(name)
}

/**
 * Adds a flag with some transforming functionality. 
 * 
 * @example
 * ```js
 * import { Marked } from 'https://deno.land/x/markdown@v2.0.0'
 * 
 * addFlag('markdown', (text, context) => {
 *     const markup = Marked.parse(text)
 *     return markup.content
 * }, {preformatted: true})
 * ```
 * 
 * @param name The (unique) name of the flag.
 * 
 * @throws {TypeError} The name provided contains non-alphanumeric
 *                     characters other than a dash (-) or underscore (_).
 * @throws {TypeError} The flag under the given name already exists.
 */
export function addFlag(name: string, transform: Transform, options?: FlagTransformOptions): void {
    config.addFlag(name, transform, options)
}

/**
 * Removes a flag. If the flag under the given name does not exist,
 * it does nothing.
 * 
 * @param name The name of the transform to remove.
 */
export function removeFlag(name: string): void {
    config.removeFlag(name)
}

/**
 * Adds a tag to be interpreted as having textual (preformatted) content only.
 * The children under elements with the given tag name will then be parsed as
 * plain text.
 * 
 * @param name A tag name.
 */

export function addPreformattedTag(name: string): void {
    config.addPreformattedTag(name)
}

/**
 * Removes a tag from the list of preformatted tags. If the tag has not been
 * added, it does nothing.
 * 
 * @param name A tag name.
 */

export function removePreformattedTag(name: string): void {
    config.removePreformattedTag(name)
}
