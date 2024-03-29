/**
 * The entry point for CSML's APIs.
 * 
 * @module
 */

import { globalCSML, config } from './src/index.js'

type Module = Record<any, any>

/**
 * The interface for the `csml` export.
 * 
 * The `csml` variable is available as "global" variable in CSML modules. It's
 * global in the sense that it is automatically imported, but it's not actually
 * on the `window` object. Outside of CSML modules, you can still use it to
 * render or import CSML modules, but of course, you have to import it
 * yourself.
 */
export interface CSML {
    /**
     * Retrieves the arguments passed to the current module. If there are no
     * arguments, or if it is used outside a module, this just evaluates to
     * `undefined`.
     */
    readonly args: unknown

    /**
     * Imports a CSML module, including the HTML and other, user-defined
     * exports. Every time this is called, the module is re-run.
     * exports. Every time this is called, the module is re-run. If called
     * inside a CSML module, the URL is relative to the module itself; outside
     * of a CSML module, it resolves to the current working directory.
     */
    import(url: string | URL, args?: any): Promise<Module>

    /**
     * Renders a CSML module. This is functionally equivalent to importing it
     * using `csml.import`, and then reading the default export. You can use
     * this to insert some HTML from another template into the current one,
     * through `:html {{ csml.render(...) }}`. Note that interpolation does not
     * require the `await` keyword for this.
     */
    render(url: string | URL, args?: any): Promise<string>

}

/**
 * Import and render CSML modules.
 * 
 * For details, see the docs for the
 * [CSML interface](https://deno.land/x/csml/mod.ts?s=CSML).
 */
export const csml: CSML = {
    get args(){ return undefined },

    async import(url: string | URL, args?: any): Promise<Module> {
        return await globalCSML.import(url, args)
    },

    async render(url: string | URL, args?: any): Promise<string> {
        return (await globalCSML.import(url, args)).default
    }

}

/**
 * Adds a transform to run over text nodes.
 * 
 * @example
 * ```js
 * addTransform('badge', (text, context) => {
 *     if(context.hasParent('main'))
 *     const regex = /\[\[(\w+)\]\]/g
 *     const replacement = '<span class="badge">$1</span>'
 *     return text.replaceAll(regex, replacement)
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
export function addFlag(
    name: string,
    transform: Transform,
    options?: FlagTransformOptions
): void {
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
 * Build a flag into a tag.
 * 
 * @example
 * ```js
 * addFlagToTag('pre', ':indent(4)')
 * ```
 * 
 * @param tagName The tag name to assume the flag for.
 * @param flag The flag as either a name, or full flag syntax. A certain
 *             flag can only be registered once, i.e. registering a second
 *             flag of the same name (with different arguments) will
 *             simply overwrite the first.
 */
export function addFlagToTag(tagName: string, flag: string){
    config.addFlagToTag(tagName, flag)
}

/**
 * Remove a previously added flag from a tag.
 * 
 * @param tagName The tag name to remove the flag for.
 * @param flag The flag as either a name, or full flag syntax. Any flag
 *             arguments are ignored.
 */
export function removeFlagFromTag(tagName: string, flag: string){
    config.removeFlagFromTag(tagName, flag)
}

/**
 * Resets the default configuration; details listed below.
 * 
 * ## Flags
 *  - `:html`: disables HTML escaping, useful for inline rendering.
 *    Removing this flag removes the HTML escaping, and is not advised.
 *  - `:text-only`: signals the parser to parse the indented content as text,
 *    collapsing all whitespace.
 *  - `:indent(amount, tabSize)`: Like :text-only, this flag signals to the
 *    parser that its contents are all text. However, it preserves whitespace,
 *    and indents the text by some amount. The flag requires a first argument,
 *    the amount of indentation. This is in terms of spaces, and may be 0. If
 *    you want to convert spaces to tabs, you may provide the second argument
 *    to indicate tab size. For example, `:indent(4, 4)` indents with 1 tab
 *    (indents with 4 spaces, then replaces multiples of 4 spaces with a
 *    tab). If your source code uses tabs for indentation (and if that is what
 *    you want this text to be indented with) then it is recommended to set the
 *    `tabSize` parameter to 1.
 * 
 * ## Transforms
 *  - `emphasis`: Replaces text wrapped in double underscores with `<em>`
 *    tags. For example, `foo __bar baz__` becomes `foo <em>bar baz</em>`.
 *  - `strong`: Similar to `emphasis`, but with `**asterisks**` and
 *    `<strong>` tags.
 *  - `code`: Similar to `emphasis`, but with 
 *    <code>\`\`backticks\`\`</code> and `<code>` tags.
 *  - `link`: A markdown-style way to format a link. For example,
 *    `[text content](https://example.com)`
 * 
 * ## Flags built into tags
 *  - `title` tags have `:text-only` built-in;
 *  - `script` tags have `:indent(0)` and `:html`;
 *  - `style` tags have `:indent(0)` and `:html`;
 *  - `textarea` tags have `:indent(0)`.
 */
export function resetToDefaults(){
    config.resetToDefaults()
}

/** The context object passed to transforms. */
export interface TransformContext {
    /**
     * Checks whether the current text node has a certain parent tag, either
     * direct parents or any of its grandparents.
     * 
     * @param name The tagname for the parent to look for.
     * @returns `true` if the given tag name exists among any of the parents of
     *          the text node being processed, `false` otherwise.
     */
    hasParent(name: string): boolean;

    /**
     * Checks whether the current text node has a certain flag enabled, because
     * it is either used on its direct parent, or any of its grandparents.
     * 
     * @param name The flag name for the parent to look for. This may or may
     *             not include the colon that comes with a flag, either works.
     * @returns `true` if the given flag exists among any of the parents of the
     *          text node being processed. `false` otherwise.
     */
    hasFlag(name: string): boolean;

    /**
     * Retrieves the argument passed to the flag used on the closest parent of
     * a certain text node, as a string.
     * 
     * @param name The name of the flag to retrieve. If multiple flags exist
     *             among the parents, the _last_ one will be used.
     * @returns If the flag does not exist among any of the text node's
     *          parents, this returns `null`; if it is used, but does not have
     *          an argument specified (e.g. `:flag`), the empty string is
     *          returned; otherwise, the argument is returned.
     */
    getFlag(name: string): null | string;
}

/** The callback used to define flags and other transforms. */
export interface Transform {
    (text: string, context: TransformContext): string | null | undefined;
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
