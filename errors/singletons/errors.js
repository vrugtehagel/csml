import messages from '../data/messages.js'

export default new class Errors {

	throw(identifier, data){
		const {type, message} = messages[identifier]
		const content = message
			.replaceAll(/{{(\w+)}}/g, (match, name) => data[name] ?? 'unknown')
		throw new type(content)
	}

}
