/**
 * The entry point for CSML's APIs.
 * 
 * @module
 */

import CSML from './src/build/index.js'
import Context from './src/build/classes/context.js'
import config from './src/config/index.js'

/** The callback used to define flags and other transforms. */
export interface Transform {
    (text: string, context: Context): string | any;
}

/** The type of the optional third argument to `addFlag`. */
export interface FlagTransformOptions {
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
    preformatted?: boolean;
}


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
export function importModule(url: URL | string, args?: any): Promise<Module> {
    return CSML.import(url, args)
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
 */
export function addTransform(name: string, transform: Transform): void {
	config.addTransform(name, transform)
}

/**
 * Removes a transform, if it exists.
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
 * @param tranform The callback to run over pieces of text. If the return
 *                 value of the callback is a string, then the text node will
 *                 be replaced by it; otherwise, the text remains unchanged.
 * @param options Change the behavior of the flag. See the
 *                `FlagTransformOptions` documentation for more info.
 */
export function addFlag(name: string, transform: Transform, options?: FlagTransformOptions): void {
    config.addFlag(name, transform, options)
}

/**
 * Removes a flag, if it exists.
 * 
 * @param name The name of the transform to remove.
 */
export function removeFlag(name: string): void {
    config.removeFlag(name)
}

/**
 * Adds a tag to be parsed as having textual content only.
 * 
 * @param name A tag name.
 */

export function addPreformattedTag(name: string): void {
    config.addPreformattedTag(name)
}

/**
 * Removes a tag from the list of preformatted tags, if it exists.
 * 
 * @param name A tag name.
 */

export function removePreformattedTag(name: string): void {
    config.removePreformattedTag(name)
}
