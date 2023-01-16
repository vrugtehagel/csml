<img width="100%" alt="image" src="https://user-images.githubusercontent.com/41021050/212775994-e54ce75e-602a-4767-9ba0-739b8497c2ca.png">

# CSML

The templating engine with syntax inspired by CSS & JS, built on Deno. Keeping things compact with the indentation-based markup and custom text transformations, together with the simple-to-understand module-based system, you'll have your site up and running in no time.


## APIs

For details on the APIs this package provides, visit [deno.land/x/csml](https://deno.land/x/csml).



## Examples

Here's a short example highlighting what CSML can do:

```
@script
  const title = 'Hello world!'

!DOCTYPE html
html.dark-theme[lang=en]
  head
    meta[charset=utf-8]

    title {{ title }}

  body
    section#hero
      header > h1 {{ title }}

      p:text-only
        Multiline text, no problem. And, handy shortcuts like __emphasized__
        or **strong** text, even [links](https://example.com). The best part;
        you can make these yourself, to suit your exact needs.
    :html {{ csml.render('./footer.csml') }}
```

## Syntax

First and foremost, CSML is an indentation-based language. This makes it so that we no longer have to worry about closing tags. In almost all places, you may use interpolation of the double curly brace variety, i.e. `{{ variable }}`. The syntax for the elements you write are based on CSS selector syntax, and the logic is all JavaScript. So, let's have a look at all this in a bit more detail.


### Interpolation

Interpolation can be used like `{{ so }}`. Make sure the actual content of your value does not contain `}}`, because it would end the interpolation early. To make your life a bit easier, interpolation stringifies values a bit differently based on context. Generally, it collapses `null` and `undefined` to the empty string `''`, and it will leave string values as-is. Within text, objects are stringified with `JSON.stringify` for debugging purposes; elsewhere, the usual conversion to a string is used. There are also some slight special treatments for single values in classes and attributes, see the below section on element syntax for details. For async code, in particular `csml.render`, it should be noted that interpolation allows un-awaited promises. The whole module, before finishing execution, will wait for all interpolated promises to be resolved, but it will do so in parallel. Essentially, `{{ await getAsyncThing() }}` is allowed, but generally less efficient than `{{ getAsyncThing() }}`.


### Element syntax

Elements are written by specifiying the following (the tag name must come first):

 - **tag name**: This is the only required one. You may use interpolation for a part or the entirety of the tag name.
 - **#id**: optional. If the value ends up being `null` or the empty string, the attribute is omitted.
 - **.classname**: You may specifiy one or more classnames. When you interpolate values, you may also provide an array, and each element of the array is then used as a class. Alternatively, you may provide space-separated strings for a single class value; they are then interpreted as multiple classes. Lastly, you may use an object, and all keys with truthy values will be used as a class. For example, `div.{{ ['foo', 'bar'] }}`, `div.{{ {foo: true, bar: 23, baz: null} }}` and `div.{{ 'foo bar' }}` are all equivalent to `div.foo.bar` and output `<div class="foo bar">`.
 - **[attribute]**: There are a few accepted forms for these. You may use single or double quotes around your values, or, in some cases, leave the quotes out, just like in HTML and CSS. For boolean attributes, you may write them like `[hidden]`, without a value at all. When using interpolation for the _entire_ value, if the interpolation results in `null` or `undefined`, the attribute is omitted. For example, `button[disabled={{ null }}]` results in just `<button>`. Lastly, for logic-heavy elements, you may specify attributes in bulk by providing an object of attribute-value combinations within the square brackets (camelCase keys will be converted to kebab-case). For example, let's say we've got a `const attrs` with the value `{foo: '23', barBaz: 'qux'}`, then `my-element[{{ attrs }}]` will result in `<my-element foo=23 bar-baz=qux>`.
 - **:flag**: reusing the pseudo-class syntax from CSS, this can be used to alter the behavior of text inside an element. There are a few defaults set already, but you may remove those or create your own using `addFlag`. You can also provide arguments to a flag, like in CSS, e.g. `:indent(4)`. Note that interpolation is permitted in flag arguments, but _not_ in flag names.

The doctype may be specified by writing `!DOCTYPE` followed by the docstring (generally, just `!DOCTYPE html`).

You may write a deeper nested stucture on a single line by using the child combinator `>`. For example, `div > span Hello!` outputs `<div><span>Hello!</span></div>`.

When the element becomes a tad long (e.g. due to long attribute values, or many class names), you may insert a newline and start the next modifier with a `&`. Note that the indentation level _must_ be the same as the element it belongs to.

Some elements may not have their children parsed as HTML, like `script` or `style`, and simply assume the content is always text-only. To alter this, use `addFlagToTag()` and `removeFlagFromTag()`. For an extensive list of the default configuration, see the documentation on deno for [`resetToDefaults()`](https://deno.land/x/csml/mod.ts?s=resetToDefaults).


### Logic

You may write complex logic in your CSML, just using JavaScript. For large blocks of script, use `@script`; its contents will not be parsed, but rather executed as-is. Note that you may also include regular scripts, ones that won't be executed, but rather emitted to the output, using the `script` tag. For in-template logic, CSML provides a simpler way of expressing statements such as `for`, `if`, `else`, or `while`. Simply start the line with `@`, and its children will be wrapped in a regular JavaScript block (that is, it will wrap curly braces around it). You may also write a statement like this on the same line as an element, for a more compact look. This means you can write, for example:
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
Keep in mind that a statement alone contributes to the indentation hierarchy; so, the code below outputs `<div></div><span></span>` (i.e. a `span` as sibling of the `div`, not the child):
```
div
@if(true)
  span
```
whereas
```
div
  @if(true)
    span
```
is equivalent to
```
div @if(true)
  span
```
and outputs `<div><span></span></div>`, that is, the `span` would be the child of the `div`.

Lastly, let's talk a bit about how CSML modules act. They are a little bit like JavaScript modules, in the sense that they can `import` and `export` values like them. CSML modules always provide a default export with the stringified HTML that is the result of the processed CSML file. CSML modules also take arguments, which are available inside a module through `csml.args`. The `csml` object is imported implicitly into your CSML modules, and has the `csml.import(url, args)` and `csml.render(url, args)` methods, allowing you to easily import other CSML templates into the current file. Note that there is an important difference between ES6 modules and CSML modules; ES6 modules only run once, whereas CSML modules re-run every time you import them. This is, of course, necessary for reusable templates to be useful and for the arguments to have any effect. Also, when importing modules to be rendered in another, use the `:html` flag followed by your `{{ csml.render(...) }}` statement; without the flag, the content will be HTML-escaped.



### Configuration

CSML offers transforms for text nodes so that writing big chunks of text becomes a lot nicer to do. It also offers those for flags specifically, and lastly, it allows for registering html tags to have a certain flag built-in. These are set using `config.addTransform`, `config.addFlag`, `config.addFlagToTag`. All of those also have a removal variant. For more details on the implementation details of the default configuration (as examples), check `src/0-configure/set-defaults.js`. To view the defaults, see the documentation on [deno.land/x/csml](https://deno.land/x/csml`).
