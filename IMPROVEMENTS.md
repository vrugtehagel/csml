# Improvements

For the next big version of CSML, I want to fix some of the major issues that CSML currently suffers from.

## Problems

- CSML parses documents and turns them into JS, but the JS file is re-parsed every time it is used because it can export things depending on the arguments. This is not particularly performance-friendly. To resolve it elegantly, we'll need to disallow CSML module exports. We can do something to mimic it, though.
- Comments. You can't really comment anything out. Currently the best solution is probably just to prepend with `@script //`, but that's not very elegant.
- A server and build system out-of-the-box. If users don't want to use that, that's fine. But I think it should be there, for simplicity.
- Currently you let users influence the way documents are parsed with flags and flags-in-tags. This is fine by itself but it makes it impossible to consistently syntax highlight files correctly. This probably means you have to remove the customization altogether.
- It would be super nice if CSML does some post-processing and actually understood the HTML it is outputting.

## Solutions

- First, for the JS parsing problem, I can do something similar as I did for Yozo; metadata at the top of the page. Instead of letting the user scatter their exports and arguments all over the files, require them to declare it at the top of the page:
```
@param sizeInfo: number
@export title: string
@export description: string
@export someOtherThing
```
Then you transform it into
```ts
export default function({ sizeInfo }: {
	sizeInfo: number;
}): {
	title: string;
	description: string;
	someOtherThing: any;
}{
	// ...

	return { title, description, someOtherThing }
}
```

- For comments; probably go `# YAML style` or `// JS style`. Probably YAML style makes more sense because it's a single character? But JS style makes more sense because it's JS...

- Figure out a nice way of setting up projects that makes sense as a default.

- Remove it in favor of starting lines with `>` (for whitespace collapsing), `|` (for preformatted text) and `<` (for just HTML). They can just be shorthands for single-line flags `:text`, `:preformatted` and once again `:text`. Also add `:escaped` instead of `:html`. Build `:escaped` into `script` and `style`, and potentially other elements that are not allowed to have children. Also add markdown-style __em__, **strong**, ``code`` and [links](/path/).

- Probably should be a separate project.
