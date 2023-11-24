import config from './config.js'


export default function setDefaults(){
	config.addFlag('html', (text, context) => {
		return text
			.replaceAll(/&(?![a-z]+;)(?!#x?[a-f\d]+;)/ig, '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
	}, {invert: true})

	config.addFlag('indent', (text, context) => {
		const args = context.getFlag('indent')
		if(!args) return
		const [amount, tabSize] = args.split(',').map(arg => Number(arg))
		const lines = text.split('\n')
		if(lines[0] == '') lines.shift()
		const indentationAmounts = lines
			.filter(line => line.trim() != '')
			.map(line => line.match(/^ */)[0].length)
		const minIndentation = Math.min(...indentationAmounts)
		const removeIndentationRegex = new RegExp(`^ {${minIndentation}}`)
		for(const [index, line] of lines.entries())
			lines[index] = line.replace(removeIndentationRegex, '')
		for(const [index, line] of lines.entries())
			lines[index] = ' '.repeat(amount) + line
		if(!tabSize) return lines.join('\n')
		if(tabSize < 0 || tabSize > 10)
			errors.throw('indent-tabsize-out-of-range')
		const convertRegex = new RegExp(`(?<=^ *)( {${tabSize}})`, 'g')
		for(const [index, line] of lines.entries())
			lines[index] = line.replaceAll(convertRegex, '\t')
		return lines.join('\n')
	}, {preformatted: true})

	config.addFlag('text-only', text => {
		return text.replaceAll(/\s+/g, ' ')
	}, {preformatted: true})

	config.addTransform('emphasis', text => {
		return text.replaceAll(/__(.+?)__/g, '<em>$1</em>')
	})

	config.addTransform('strong', text => {
		return text.replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
	})

	config.addTransform('code', text => {
		return text.replaceAll(/``(.+?)``/g, '<code>$1</code>')
	})

	config.addTransform('link', text => {
		const regex = /\[(.*?)\]\((?=https?:\/\/|\.|\/)(.+?)\)/g
		return text.replaceAll(regex, (match, content, url) => {
			url = url.replaceAll(/&(?![a-z]+;)(?!#x?[a-f\d]+;)/ig, '&amp;')
			const href = /[ ='"`<>]/.test(url)
				? `href="${url.replaceAll('"', '&quot;')}"`
				: `href=${url}`
			return `<a ${href}>${content}</a>`
		})
	})

	config.addFlagToTag('title', ':text-only')
	config.addFlagToTag('script', ':indent(0)')
	config.addFlagToTag('script', ':html')
	config.addFlagToTag('style', ':indent(0)')
	config.addFlagToTag('style', ':html')
	config.addFlagToTag('textarea', ':indent(0)')

}
