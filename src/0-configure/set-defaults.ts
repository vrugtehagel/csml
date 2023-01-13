import config from './config.ts'


export default function setDefaults(){

	config.addFlag('html', (text, context) => {
		return text
			.replaceAll(/&(?![a-z]+;)(?!#x?[a-f\d]+;)/ig, '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
	}, {invert: true})

	config.addFlag('preformatted', text => null, {preformatted: true})

	config.addFlag('indent', (text, context) => {
		const args = context.getFlag('indent')
		if(!args) return 
		const [amount, tabSize] = args.split(',').map(arg => Number(arg))
		const indentString = ' '.repeat(amount)
		const indented = `\n${text}`.replaceAll('\n', '\n' + indentString)
			// .replace(/\n+$/, '\n')
		if(!tabSize) return indented.slice(1)
		if(tabSize < 0 || tabSize > 10)
			errors.throw('indent-tabsize-out-of-range')
		const regex = new RegExp(`\n( {${tabSize}})+`, 'g')
		const tabIndentString = '\t'.repeat(match.length / tabSize)
		return indented
			.replaceAll(regex, match => '\n' + tabIndentString)
			.slice(1)
	}, {preformatted: true})

	config.addFlag('text-only', text => {
		return text.replaceAll(/\s+/g, ' ')
	}, {preformatted: true})

	config.addTransform('emphasis', text => {
		return text.replaceAll(/__((?:[^_]|_(?!_))+)__/g, '<em>$1</em>')
	})

	config.addTransform('strong', text => {
		return text.replaceAll(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, '<strong>$1</strong>')
	})

	config.addTransform('code', text => {
		return text.replaceAll(/``((?:[^`]|`(?!`))+)``/g, '<code>$1</code>')
	})

	config.addTransform('link', text => {
		const regex = /\[(\b[^\]]+\b)\]\(([^)]+)\)/g
		return text.replaceAll(regex, (match, content, url) => {
			url = url.replaceAll(/&(?![a-z]+;)(?!#x?[a-f\d]+;)/ig, '&amp;')
			const href = /[ ='"`<>]/.test(url)
				? `href="${url.replaceAll('"', '&quot;')}"`
				: `href=${url}`
			return `<a ${href}>${content}</a>`
		})
	})

	config.addFlagToTag('title', ':text-only')
	config.addFlagToTag('script', ':preformatted')
	config.addFlagToTag('style', ':preformatted')
	config.addFlagToTag('textarea', ':preformatted')

}
