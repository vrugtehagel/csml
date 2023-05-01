/**
 * The entry point for CSML CLI.
 * 
 * 
 * You may use the CLI instead of the JS API, though functionality is more
 * limiting. You may specify one input file to be processed. It will write to
 * stdout by default, but you may write to a file by specifying `--out`.
 * 
 * You can use the `--add-flag-to-tag` and `remove-flag-from-tag`
 * flags to invoke `addFlagToTag` and `removeFlagFromTag` respectively. The
 * flags expect a single string of `tag-name:flag` (i.e. tag name and flag
 * separated by a colon), and both flags may be used multiple times. One may
 * also use `--remove-flag` and `--remove-transform`; the given value will be
 * passed directly to `removeFlag` and `removeTransform` respectively. These
 * flags may also be used multiple times.
 * 
 * You may also pass some arguments to the CSML module being run. This will be
 * passed as second argument to `csml.render()`. The second argument, when using
 * the CLI command, is always an object; you may then specify keys on the object
 * using arbitrary flags prefixed with `arg-`. For example, using the flag
 * `--arg-fooBar=hello` will pass `{fooBar: 'hello'}` to the CSML module being
 * rendered.
 * 
 * @module
 * 
 * @example
 * ```bash
 * deno run https://deno.land/x/csml/cli.ts \
 *   ./mymarkup.csml \
 *   --out=./index.html \
 *   --add-flag-to-tag="pre:indent(0)" \
 *   --add-flag-to-tag=h1:text-only \
 *   --remove-transform=code \
 *   --arg-pageTitle="Hello world!" \
 *   --arg-lazyLoadImages
 * ```
 */

import * as flags from 'https://deno.land/std@0.185.0/flags/mod.ts'
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts'
import * as mod from './mod.ts'

const collect = [
	'add-flag-to-tag',
	'remove-transform',
	'remove-flag',
	'remove-flag-from-tag'
]
const options = flags.parse(Deno.args, {collect})

for(const name of collect) options[name] ??= []
options['remove-flag-from-tag'] = options['remove-flag-from-tag']
	.map(input => input.split(':', 1))
options['add-flag-to-tag'] = options['add-flag-to-tag']
	.map(input => input.split(':', 1))

for(const name of options['remove-transform']) mod.removeTransform(name)
for(const name of options['remove-flag']) mod.removeFlag(name)
for(const [tagName, flag] of options['remove-flag-from-tag'])
	mod.removeFlagFromTag(tagName, flag)
for(const [tagName, flag] of options['add-flag-to-tag'])
	mod.addFlagToTag(tagName, flag)

const args = Object.fromEntries(Object.entries(options)
	.filter(([name]) => name.startsWith('arg-'))
	.map(([name, value]) => [name.slice(4), value])
)

if(options['_'].length == 0)
	throw Error('You must specify one input file to process.')
const input = path.toFileUrl(path.resolve(Deno.cwd(), options['_'][0]))
const html = await mod.csml.render(input, args)
if(options['out']) await Deno.writeTextFile(options['out'], html)
else await Deno.stdout.write(new TextEncoder().encode(html))
