# CSML

CSML is an extremely flexible and easy-to-use templating language. It leverages the selector syntax from CSS that you already know and love in order to create an intuitive, concise way to mark up a document. Additionally, it uses JavaScript for its logic, so that you can feel comfortable right away. Here's what a CSML document could look like:

```
@script
  import { drinks } from '../data/drinks.js'
  const title = 'My favorite drinks'

head
  title {{ title }}

body
  header > h1 {{ title }}
  
  ul#drinks-list @for(const drink of drinks)
    li.drink {{ drinks }}
```

## Motivation

Why create CSML? HTML is an XML-like language, which means it's nice for computers to parse, but it's not quite so nice for humans to read or write it. Closing tags are generally bloat, because we already use indentation to signify where nodes go. Furthermore, HTML is quite inconvenient for articles with a lot of inline tags, such as _emphasized text_, `inline code`, or even just [links](https://example.com). Markdown fixes these issues to some extent, but is rather limited in use; one has no control over how things are outputted, and e.g. adding a class to an `<em>` forces the author to fall back to HTML. CSML allows you to configure your own shorthands for e.g. `inline code`, or special cases like `<mark>` or `<span data-hint="Foo!">`. While CSML provides sensible defaults (that are similar to Markdown), you may remove or overwrite these.

Additionally, other templating languages usually come with their own syntax, often their own logic as well, which makes them harder to learn. CSML leverages the knowledge you already have so that you can focus on producing high-quality code right away.

## Docs

### Formatting

CSML uses indentation to decide what goes where. This allows it to be compact and easy to maintain. It ignores empty newlines (but does not discard them in preformatted contexts). Comments are also ignored and do not contribute to the indentation hierarchy.

### Comments

You may use single-line JavaScript-style comments. They are ignored (as comments usually are).

### Interpolation

For interpolation, use double curly braces. For example, `Hello {{ name }}!`. Note that CSML parses this relatively naively, so if the content of the interpolated value contains `}}`, it will end the interpolation early. To combat this, either escape them if they are part of a string (e.g. `{{ '<o\}\}\}><' }}` outputs "&lt;o}}}><") or add whitespace (e.g. change `{{ ({obj: {foo: 23} }).obj.foo }}` into something like `{{ ({ obj: { foo: 23 } }).obj.foo }}`). You may use interpolation almost anywhere, but it should always be within a single token. For example, `div{{ '#foo.bar' }}` is not equivalent to `div#foo.bar`; however, one can do `div#{{ 'foo' }}.{{ 'bar' }}`.

Interpolation works a bit differently depending on context, to provide the most sensible experience. Generally, it collapses `null` or `undefined` into the empty string. When assigning `null` or `undefined` to an attribute value however, it omits the attribute completely (i.e. `div[hidden={{ null }}]` is equivalent to just `div`). If it is part of the attribute value however, it collapses as usual (e.g. `div[title="Hello {{ null }}"` turns into `div[title="Hello "]`). Objects stringify as they usually would, but in text content, they are expanded like `JSON.stringify` would do for easy debugging. Interpolation also allows promises. Additionally, if the promise resolves to a module (usually as a result of `import()` or `csml.include()`), and the module has a default export, then that is used as interpolated value.

Flag names cannot contain interpolations, because the parsing of the indented children depends on flags.

### Logic

Logic in CSML files is done through JavaScript. In fact, CSML files are kind of just modules; you can import and export files as you normally do in JavaScript modules. CSML denotes scripts with `@script`; everything indented is used as-is. There is a shorthand however for inline statements such as `for` or `if`; A statement can be started by an `@` followed by the statement directly. The curly braces for the statement are automatically wrapped around the indented content of the statement. For example:
```
@script
  const drinks = ['coffee', 'tea', 'water']

main
  @if(drinks.length > 0)
    ul @for(const drink of drinks)
      li {{ drink }}
  @else
    p There are no drinks!
```
As you can see by the above example, you may also put the @-statement on the same line as an element for a more compact format.

#### API in CSML modules

You may use the `csml` "global" (i.e. automatically imported constant) in your CSML files. It has an `include` method, that allows you to import another CSML module into the current file. You can dump its results into the file directly, or you can `await` it in a JavaScript block. In the latter, you get access to all the exported variables, including the default export (which is a string of HTML, the output of the imported file). The `include` function takes a url as first argument, and an optional second argument to be passed to the included module. For example:
```
@script
  const module = await csml.include('./about.csml', {name: 'vrugtehagel'})
  const html = module.default
  const {title} = module

title {{ title }}

main
  {{ html }}

footer
  :html {{ csml.include('./footer.cmsl') }}
```
The arguments passed to a CSML module can be accessed through `csml.args`. Text is HTML-escaped by default, so in order to render a `csml.include` as HTML, you'll need the `:html` flag.

### Elements

To define elements, use CSS selector syntax. The order CSML requires is: tag name, id, class names, attributes, and flags. Of course, all but the tag name are optional. Attribute values may use no quotes at all if it would be valid in CSS, or you may use single or double quotes. Boolean attributes, like `[hidden]` are also allowed. Lastly, you may use the child combinator for a compact way to write nested children. For example, `header#foo > h1 Hello world!` outputs `<header id=foo><h1>Hello world!</h1></header>`.

### Text transforms

In order to write large amounts of text comfortably, CSML offers _transforms_. These are functions running over each piece of text in the document. You may register them using the `addTransform` function. It accepts a name as first argument, and a function as second argument. The callback gets two argument itself; first, the text, and then a `Context` object, which allows you to do some basic querying so the transform only runs when you want to. If the transform returns a string, the text is replaced by that string. Otherwise, it does not change. Here's an example:
```js
import { addTransform } from 'csml'

addTransform('preformatted', (text, context) => {
  if(context.hasFlag('preformatted')) return
  return text.replaceAll(/\s+/g, ' ')
})
```
The methods available for the `context` object are `hasFlag`, `getFlag`, `hasParent`, and `isDirectChildOf`. You can also remove transforms using the `removeTransform` method, which accepts a name argument only.

The default transforms are, in order:
 - `html`: Escapes text content, if it is not inside a `:html` flag.
 - `whitespace-formatting`: Handles the `:preformatted` and `indent` flags.
 - `emphasis`: Allows single underscores `_around some text_` to turn into ems `<em>around some text</em>`
 - `strong`: Similar to `emphasis`, but with asterisks (`*`) and `<strong>`.
 - `code`: Similar to `emphasis`, but with backticks (<code>\`</code>) and `<code>`.
 - `link`: Allows markdown-style links, like `\[example\]\(https://example.com)`

### Flags

There are a few built flags:
 - `:html`: disables HTML escaping (which happens by default).
 - `:preformatted`: Maintain whitespace in a multiline block of text. Equivalent to `:indent(0)`.
 - `:indent(amount, tabSize)`: Maintain whitespace in a multiline block of text, and increase its indentation by `amount` spaces. Omit `tabSize` if spaces suffice. If `tabSize` is specified, the indentation will be converted to tabs, respecting the given tab size.


