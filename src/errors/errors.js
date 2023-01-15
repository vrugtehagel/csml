import messages from './messages.js'

export default new class Errors {
	throw(name, data = {}){
		const {type} = messages[name]
		if(data.reader) this.#renderLine(data.reader, data.isFile)
		const message = this.#getMessage(name, data)
		throw type(message)
	}

	warn(name, data = {}){
		if(data.reader) this.#renderLine(data.reader, data.isFile)
		const message = this.#getMessage(name, data)
		console.warn('%c' + message, 'color:yellow')
	}

	#getMessage(name, data){
		if(!(name in messages)) this.throw('never')
		const definition = messages[name]
		const applyData = text =>
			text.replaceAll(/{(\w+)}/g, (match, name) => data[name])
		const message = applyData(definition.message)
		const help = definition.help ? '\n' + applyData(definition.help) : ''
		return message + help
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
