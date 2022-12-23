import messages from '../data/messages.js'

export default new class Errors {

	#thrownSyntaxError = false

	throw(identifier, data){
		const {type, message} = messages[identifier]
		const content = message
			.replaceAll(/{{(\w+)}}/g, (match, name) => data[name] ?? 'unknown')
		throw new type(content)
	}

	async throwSyntaxError({url, col, row, error}){
		console.log(`%cerror%c: Uncaught SyntaxError: ${error.message}`,
			'color:red;font-weight:bold',
			'color:white'
		)
		const file = await Deno.readTextFile(url)
		const line = file.split('\n')[row]
		console.log(line)
		if(col < 0) col = line.length + col
		if(col != null)
			console.log(' '.repeat(col) + '%c^', 'color:red')
		else
			console.log()
		if(this.#thrownSyntaxError) return
		this.#thrownSyntaxError = true
		console.log(`    %cat %c${url}%c:%c${row}%c:%c${col}`,
			'color:white',
			'color:cyan',
			'color:white',
			'color:yellow',
			'color:white',
			'color:yellow'
		)
		console.log()
		console.log()
		console.log('Original error:')
		throw error
	}

}
