import { assertEquals } from 'https://deno.land/std@0.132.0/testing/asserts.ts'

import { csml, addFlagToTag } from '../mod.ts'

Deno.test('rendering the page', async () => {
	addFlagToTag('foo-bar', ':indent(0)')
	const page = await csml.render('tests/base.csml')
	assertEquals(page, `<!DOCTYPE html><html lang=en><meta charset=utf-8><title>Test page.</title><main><header><h1>Test page.</h1></header><section id=tag-name-tests><div></div><div></div><div></div></section><section id=id-tests><div id=id-0></div><div id=id-1></div><div id=id-2></div><div></div><div></div></section><section id=class-tests><div class="foo bar"></div><div class="foo bar"></div><div class="foo bar"></div><div class="foo bar"></div><div></div><div></div></section><section id=attribute-tests><div data-attr=value></div><div data-attr=value></div><div data-attr=value></div><div data-attr=value></div><div data-attr=value></div><div data-attr=value></div><div data-attr=value></div><div></div><div></div><div data-attr></div><div data-attr></div></section><section id=flag-tests><div><div>test</div></div><div> div test</div><div>div
test</div><div>			div
		test</div></section><section id=element-tests><div id=id-3 class="foo bar" data-attr=value> div test</div><div><div class=foo><div class=bar><div id=id-4></div></div></div></div></section><section id=interpolation-tests><div>foo \`bar \${ baz }\` \` qux </div></section><section id=statement-tests><div><div>test 0</div><div>test 1</div></div><div><div>test 0</div><div>test 1</div></div><div></div><div>test 0</div><div>test 1</div><div class=if-true></div><div class=if-false-else></div></section><section id=import-tests><div>the secret is 23</div><foo-bar>This is side.csml
and the secret is sqrt(3025)</foo-bar><ul><li>object: {"foo":"bar","baz":23}</li><li>array: ["foo","bar","baz"]</li></ul></section><section id=transform-tests><div><em>emphasized</em> <strong>strong <a href=https://example.com><code>codelink</code></a></strong> [not](link)</div></section></main></html>`)
})
