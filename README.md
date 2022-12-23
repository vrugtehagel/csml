# CSML

The templating engine with CSS & JS inspired syntax built on Deno. Keeping things compact with the indentation-based markup and custom text transformations, together with the simple-to-understand module-based system, you'll have your site up and running in no time.



## APIs

For details on the APIs this package provides, visit [deno.land/x/csml](https://deno.land/x/csml).



## Examples

For an example, see the `/example` folder. It contains a "project" of a single page, with some additional included CSML files. It should give you a fairly decent idea of what CSML does, and how.



## Syntax

First and foremost, CSML is an indentation-based language. This makes it so that we no longer have to worry about closing tags. In almost all places, you may use interpolation of the double curly brace variety, i.e. `{{ variable }}`. CSML support single-line comments with double slashes (`// comment`). The syntax for the elements you write are based on CSS selector syntax, and the logic is all JavaScript. So, let's have a look at all this in a bit more detail.


### Interpolation

Interpolation can be used like `{{ so }}`. Make sure the actual content of your value does not contain `}}`, because it would end the interpolation early. To make your life a bit easier, interpolation stringifies values a bit differently based on context. Generally, it collapses `null` and `undefined` to the empty string `''`, and it will leave string values as-is. Within text, objects are stringified with `JSON.stringify` for debugging purposes; elsewhere, the usual conversion to a string is used. There are also some slight special treatments for classes and attributes, see the below section on element syntax for details.


### Element syntax

Elements are written by specifiying the following, in order:

 - **tag name**: This is the only required one. You may use interpolation for a part or the entirety of the tag name.
 - **#id**: optional. If the value ends up being `null` or the empty string, the attribute is omitted.
 - **.classname**: You may specifiy one or more classnames. When you interpolate values, you may also provide an array, and each element of the array is then used as a class. Alternatively, you may provide space-separated strings for a single class value; they are then interpreted as multiple classes. For example, `div.{{ ['foo', 'bar'] }}` and `div.{{ 'foo bar' }}` are both equivalent to `div.foo.bar` and output `<div class="foo bar">`.
 - **[attribute]**: There are a few accepted forms for these. You may use single or double quotes around your values, or, in some cases, leave the quotes out, just like in HTML and CSS. For boolean attributes, you may write them like `[hidden]`, without a value at all. When using interpolation for the _entire_ value, if the interpolation results in `null` or `undefined`, the attribute is omitted. For example, `button[disabled={{ null }}]` results in just `<button>`. Lastly, for logic-heavy elements, you may specify attributes in bulk by providing an object of attribute-value combinations withing the square brackets. For example, let's say we've got a `const attrs` with the value `{foo: '23', bar: 'baz'}`, then `my-element[{{ attrs }}]` will result in `<my-element foo=23 bar=baz>`.
 - **:flag**: reusing the pseudo-class syntax from CSS, this can be used to alter the behavior of text inside an element. There are a few defaults set already, but you may remove those or create your own using `addFlag`. You can also provide arguments to a flag, like in CSS, e.g. `:indent(4)`. Note that interpolation is permitted in flag arguments, but _not_ in flag names.

The doctype may be specified by writing `!DOCTYPE` followed by the docstring (generally, just `!DOCTYPE html`).

You may write a deeper nested stucture on a single line by using the child combinator `>`. For example, `div > span Hello!` outputs `<div><span>Hello!</span></div>`.

Some elements may not have their children parsed, like `script` or `style`, and simply assume the content is always text-only. To alter this, use `addPreformattedTag()` and `removePreformattedTag()`. For an extensive list of the default configuration, see the configuration section below.


### Logic

You may write complex logic in your CSML, just using JavaScript. For large blocks of script, use `@script`; its contents will not be parsed and executed as JavaScript. Note that you may also include regular scripts, ones that won't be executed, but rather emitted to the output, using the `script` tag. For in-template logic, CSML provides a simpler way of expressing statements such as `for`, `if`, `else`, or `while`. Simply start the line with `@`, and its children will be wrapped in a regular JavaScript block (that is, it will wrap curly braces around it). You may also write a statement like this on the same line as an element, for a more compact look. This means you can write, for example:
```
  @script
    import capitalize from './helpers/capitalize.js'

    const drinks = ['tea', 'coffee', 'water', 'juice']
      .map(drink => capitalize(drink))

  @if(drinks.length > 0)
    ul @for(const drink of drinks)
      li.drink {{ drink }}
  @else
    p There are no drinks available.
```

Lastly, let's talk a bit about how CSML modules act. They are a little bit like JavaScript modules, in the sense that they can `import` and `export` values like them. CSML modules always provide a default export with the stringified HTML that is the result of the processed CSML file. CSML modules also take arguments, which are available inside a module through `csml.args`. The `csml` object is imported implicitly into your CSML modules, and it also has the `csml.include(url, args)` method, allowing you to easily include other CSML templates into the current file. Note that there is an important difference between ES6 modules and CSML modules; ES6 modules can only be run once, whereas CSML modules re-run every time you include them. This is, of course, necessary for reusable templates to be useful. 



### Configuration

CSML offers transforms for text nodes so that writing big chunks of text becomes a lot nicer to do. It also offers those for flags specifically, and lastly, it allows for registering html tags to be "text-only". These are simply set using `addTransform`, `addFlag`, `addPreformattedTag`. For more details on the implementation details, check `src/config/index.js`.

#### Flags

 - `'html'`: disables HTML escaping. Removing this flag removes the HTML escaping, and is not advised.
 - `'preformatted'`: signals the parser to parse the children as plain text.
 - `'indent'`: Similar to `'preformatted'`, but also indents the text by some amount. The flag requires a first argument, the amount of indentation. This is in terms of spaces. If you want to convert spaces to tabs, you may provide the second argument to indicate tab size. For example, `:indent(4, 4)` indents with 1 tab (indents with 4 spaces, then replaces multiples of 4 spaces with a tab).
 - `'text-only'`: Similar to `'preformatted'`, but collapses all whitespace.

#### Transforms

 - `'emphasis'`: Replaces underscores wrapping around text with `<em>` tags. For example, `foo _bar baz_` becomes `foo <em>bar baz</em>`.
 - `'strong'`: Similar to `'emphasis'`, but with `*asterisks*` and `<strong>` tags.
 - `'code'`: Similar to `'emphasis'`, but with <code>\`backticks\`</code> and `<code>` tags.
 - `'link'`: A markdown-style way to format a link, i.e. `[text content](https://example.com)`.

#### Preformatted tags

By default, the tags registered as preformatted are `title`, `script`, `style`, `textarea`.
