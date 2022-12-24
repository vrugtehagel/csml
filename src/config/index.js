import config from './singletons/config.js'

import html from '../html/index.js'
import errors from '../errors/index.js'

config.addFlag('html', text => {
	return text
		.replaceAll(/&(?![a-z]+;)(?!#x\d+;)/g, '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
}, {invert: true})

config.addFlag('keep-trailing-newlines', text => {
	return text.replaceAll(/\n+$/g, '')
}, {invert: true, preformatted: true})

config.addFlag('preformatted', text => null, {preformatted: true})

config.addFlag('indent', (text, context) => {
	const args = context.getFlag('indent')
	if(!args) return 
	const [amount, tabSize] = args.split(',').map(arg => Number(arg))
	const indented = `\n${text}`.replaceAll('\n', '\n' + ' '.repeat(amount))
		.replace(/\n+$/, '\n')
	if(!tabSize) return indented.slice(1)
	if(tabSize > 10) errors.throw('tabsize-too-large', {args})
	const regex = new RegExp(`\n( {${tabSize}})+`, 'g')
	return indented
		.replaceAll(regex, match => '\t'.repeat(match.length / tabSize))
		.slice(1)
}, {preformatted: true})

config.addFlag('text-only', text => {
	return text.replaceAll(/\s+/g, ' ')
}, {preformatted: true})



config.addTransform('emphasis', text => {
	return text.replaceAll(/_(\b[^_]+\b)_/g, '<em>$1</em>')
})

config.addTransform('strong', text => {
	return text.replaceAll(/\*(\b[^\*]+\b)\*/g, '<strong>$1</strong>')
})

config.addTransform('code', text => {
	return text.replaceAll(/`(\b[^`]+\b)`/g, '<code>$1</code>')
})

config.addTransform('link', text => {
	return text.replaceAll(/\[(\b[^\]]+\b)\]\(([^)]+)\)/g, (match, content, url) => {
		const href = html.getAttribute('href', url)
		return `<a${href}>${content}</a>`
	})
})

for(const tag of ['title', 'script', 'style', 'textarea'])
	config.addPreformattedTag(tag)

export default config
