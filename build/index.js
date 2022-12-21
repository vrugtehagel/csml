import CSML from './classes/csml.js'
import htmlBuilder from './singletons/html-builder.js'

CSML.addTransform('html', (text, context) => {
	if(context.hasFlag('html')) return
	return text
		.replaceAll(/&(?![a-z]+;)(?!#x\d+;)/g, '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
})

CSML.addTransform('whitespace-formatting', (text, context) => {
	if(!context.hasFlag('indent')){
		if(context.hasFlag('preformatted')) return
		return text.replaceAll(/\s+/g, ' ')
	}
	const args = context.getFlag('indent')
	if(!args) return 
	const [amount, tabSize] = args.split(',').map(arg => Number(arg))
	const indented = `\n${text}`.replaceAll('\n', ' '.repeat(amount))
	if(!tabSize) return indented.slice(1)
	if(tabSize > 10) throw Error(':indent tabsize cannot be greater than 10')
	const regex = new RegExp(`\n( {${tabSize}})+`, 'g')
	return indented
		.replaceAll(regex, match => '\t'.repeat(match.length / tabSize))
		.slice(1)
})

CSML.addTransform('emphasis', text => {
	return text.replaceAll(/_(\S[^_]*\S|\S)_/g, '<em>$1</em>')
})

CSML.addTransform('strong', text => {
	return text.replaceAll(/\*(\S[^\*]*\S|\S)\*/g, '<strong>$1</strong>')
})

CSML.addTransform('code', text => {
	return text.replaceAll(/`(\S[^`]*\S|\S)`/g, '<code>$1</code>')
})

CSML.addTransform('link', text => {
	return text.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (match, content, url) => {
		const href = htmlBuilder.getAttribute('href', url)
		return `<a${href}>${content}</a>`
	})
})

export default CSML
