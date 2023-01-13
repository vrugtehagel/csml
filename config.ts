import { config } from './src/index.ts'
import type { TransformContext, Transform, FlagTransformOptions } from './src/types.ts'

export { TransformContext, Transform, FlagTransformOptions }

export const configAPI = {
	/**
	 * Adds a transform to run over text nodes.
	 * 
	 * @example
	 * ```js
	 * context.addTransform('badge', (text, context) => {
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
	addTransform(name: string, transform: Transform): void {
		config.addTransform(name, transform)
	},

	/**
	 * Removes a transform, if it exists.
	 * @param name The name of the transform to remove.
	 */
	removeTransform(name: string): void {
	    config.removeTransform(name)
	},

	/**
	 * Adds a flag with some transforming functionality. 
	 * 
	 * @example
	 * ```js
	 * import { Marked } from 'https://deno.land/x/markdown@v2.0.0'
	 * 
	 * config.addFlag('markdown', (text, context) => {
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
	addFlag(name: string, transform: Transform, options?: FlagTransformOptions): void {
	    config.addFlag(name, transform, options)
	},

	/**
	 * Removes a flag, if it exists.
	 * 
	 * @param name The name of the transform to remove.
	 */
	removeFlag(name: string): void {
	    config.removeFlag(name)
	},

	/**
	 * Build a flag into a tag.
	 * 
	 * @example
	 * ```js
	 * config.addFlagToTag('pre', ':indent(4)')
	 * ```
	 * 
	 * @param tagName The tag name to assume the flag for.
	 * @param flag The flag as either a name, or full flag syntax. A certain
	 *             flag can only be registered once, i.e. registering a second
	 *             flag of the same name (with different arguments) will
	 *             simply overwrite the first.
	 */
	addFlagToTag(tagName: string, flag: string){
		config.addFlagToTag(tagName, flag)
	},

	/**
	 * Remove a previously added flag from a tag.
	 * 
	 * @param tagName The tag name to remove the flag for.
	 * @param flag The flag as either a name, or full flag syntax. Any flag
	 *             arguments are ignored.
	 */
	removeFlagFromTag(tagName: string, flag: string){
		config.removeFlagFromTag(tagName, flag)
	},

	/**
	 * Resets the default configuration; details listed below.
	 * 
	 * ## Flags
	 *  - `:html`: disables HTML escaping, useful for inline rendering.
	 *    Removing this flag removes the HTML escaping, and is not advised.
	 *  - `:preformatted`: signals the parser to parse the indented content
	 *    as text, but does not further process the text.
	 *  - `:text-only`: Similar to `:preformatted`, but collapses all
	 *    whitespace.
	 *  - `:indent(amount, tabSize)`: Similar to `'preformatted'`, but also
	 *     indents the text by some amount. The flag requires a first argument,
	 *     the amount of indentation. This is in terms of spaces. If you want
	 *     to convert spaces to tabs, you may provide the second argument to
	 *     indicate tab size. For example, `:indent(4, 4)` indents with 1 tab
	 *     (indents with 4 spaces, then replaces multiples of 4 spaces with a
	 *     tab).
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
	 *  - `title` tags are `:text-only` by default;
	 *  - `script` tags are `:preformatted`;
	 *  - `style` tags are `:preformatted`;
	 *  - `textarea` tags are `:preformatted`.
 	 */
	resetToDefaults(){
		config.resetToDefaults()
	}

}
