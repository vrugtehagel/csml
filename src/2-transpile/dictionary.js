export default {
	doctype: (transpiler, token, content) => {
		const doctype = transpiler.tag('doctype', token)
		return transpiler.call('doctype', doctype) + content
	},
	script: (transpiler, token) => token + '\n',
	statement: (transpiler, token, content) => {
		const call = transpiler.call('level') + '\n'
		return transpiler.transpile('inlineStatement', token, call + content)
	},
	inlineStatement: (transpiler, token, content) => {
		return `${token}/**/\n{\n${content}}\n`
	},
	textNode: (transpiler, token) => {
		const text = transpiler.tag('text', token.text)
		const flags = transpiler.transpile('flags', token.flags)
		const node = `{flags:${flags}}`
		return transpiler.call('write', node, text)
	},
	id: (transpiler, token) => transpiler.tag('id', token),
	className: (transpiler, token) => {
		return transpiler.tag('className', token)
	},
	classNames: (transpiler, token) => {
		if(!token) return '[]'
		const classNames = token
			.map(className => transpiler.transpile('className', className))
		return `[${classNames}]`
	},
	attribute: (transpiler, token) => {
		const name = transpiler.tag('attributeName', token.name)
		const value = transpiler.tag('attributeValue', token.value ?? '``')
		return `{name:${name},value:${value}}`
	},
	attributes: (transpiler, token) => {
		if(!token) return '[]'
		return `[${token
			.map(attribute => transpiler.transpile('attribute', attribute))}]`
	},
	flag: (transpiler, token) => {
		const name = transpiler.tag('flagName', token.name)
		const args = transpiler.tag('flagArguments', token.arguments)
		return `{name:${name},arguments:${args}}`
	},
	flags: (transpiler, token) => {
		if(!token) return '[]'
		return `[${token.map(flag => transpiler.transpile('flag', flag))}]`
	},
	descendant: (transpiler, token) => {
		const tagName = transpiler.tag('tagName', token.tagName)
		const id = transpiler.transpile('id', token.id)
		const classNames = transpiler.transpile('classNames', token.classNames)
		const attributes = transpiler.transpile('attributes', token.attributes)
		const flags = transpiler.transpile('flags', token.flags)
		return `{${Object.entries({tagName, id, classNames, attributes, flags})
			.map(([key, value]) => `${key}:${value}`)}}`
	},
	element: (transpiler, token, content) => {
		const descendants = []
		for(let current = token; current; current = current.descendant)
			descendants.push(current)
		const last = descendants.at(-1)
		const args = descendants
			.map(descendant => transpiler.transpile('descendant', descendant))
		if(last.text) args.push(transpiler.tag('text', last.text))
		let result = transpiler.call('write', ...args)
		const {statement} = last
		if(!statement) return result + content
		result += transpiler.transpile('inlineStatement', statement, content)
		return result
	}
}
