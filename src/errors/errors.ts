import messages from './messages.ts'

export default new class Errors {
	throw(name, data = {}){
		if(!(name in messages)) this.throw('self', {name, action: 'throw'})
		const {type, message, help} = messages[name]
		if(data.reader) this.#renderLine(data.reader, data.isFile)
		let content = message.replace(/{(\w+)}/g, (match, name) => data[name])
		if(help) content += '\n' + help
		throw type(content)
	}

	warn(name, data = {}){
		if(!(name in messages)) this.throw('self', {name, action: 'warn'})
		const {message, help} = messages[name]
		if(data.reader) this.#renderLine(data.reader, data.isFile)
		let content = message.replace(/{(\w+)}/g, (match, name) => data[name])
		if(help) content += '\n' + help
		console.warn('%c' + content, 'color:yellow')
	}

	#renderLine(reader, isFile){
		const {source, value} = reader
		const index = source.length - value.length
		const linesBeforeError = source.slice(0, index).split('\n')
		const lines = source.split('\n')
		const lineIndex = linesBeforeError.length - 1
		const errorIndex = linesBeforeError.at(-1)?.length ?? 0
		const lineNumberLength = Math.log(lineIndex + 2) / Math.log(10) + 1
		const getRuler = index => isFile
			? `${index + 1}`.padStart(lineNumberLength, ' ') + ' | '
			: ''
		const getLine = index => `%c${getRuler(index)}%c${lines[index]}`
		const drawLine = index =>
			console.log(getLine(index), 'color:yellow', 'color:white')
		if(lineIndex > 0) drawLine(lineIndex - 1)
		drawLine(lineIndex)
		const errorPaddingLength = isFile ? lineNumberLength + 3 : 0
		const errorPadding = ' '.repeat(errorPaddingLength + errorIndex)
		console.log(errorPadding + '%c^', 'color:red')
		if(lineIndex + 1 < lines.length) drawLine(lineIndex + 1)

	}

}
