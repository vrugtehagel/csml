import TextProcessor from '../classes/text-processor.js'

export default new class Generator {
	secret = (Math.random() * 0xffffff | 0).toString(16)
	scope = `csml['${this.secret}']`
	csmlURL = new URL('../../build/index.js', import.meta.url)

	getHeader(args){
		const {csmlURL, secret} = this
		const csml = `(await import('${csmlURL}')).default`
		return `const csml = new (${csml})('${secret}',import.meta,${args});\n`
	}

	getFooter(){
		const {scope} = this
		return `await ${scope}.finalize();export default ${scope}.getHTML();\n`
	}

	stringifyFlag({FlagName, FlagArguments}){
		const {scope} = this
		return `['${FlagName}']:${scope}.string\`${FlagArguments ?? ''}\``
	}

	stringifyAttr({AttrName, EqualsAttrValue}){
		const {scope} = this
		const key = `[${scope}.attrName\`${AttrName}\`]`
		const value = `${scope}.attrValue\`${EqualsAttrValue ?? ''}\``
		return `${key}:${value}`
	}

	stringifyTagName(TagName){
		const {scope} = this
		return `tagName:${scope}.string\`${TagName}\``
	}

	stringifyElement({TagName, Attr, Flag, Id, ClassName}){
		const {scope} = this
		const tagName = this.stringifyTagName(TagName)
		const attributes = Attr.map(data => this.stringifyAttr(data))
		if(Id) attributes.push(`id:${scope}.string\`${Id}\``)
		if(ClassName.length > 0)
			attributes.push(`class:${scope}.class\`${ClassName.join(' ')}\``)
		const flags = Flag.map(data => this.stringifyFlag(data))
		return `{${tagName},attributes:{${attributes}},flags:{${flags}}}`
	}

	stringifyElements({Element, DescendantElement}){
		const elements = [Element, ...DescendantElement]
		return elements.map(data => this.stringifyElement(data))
	}

	stringifyFlowControl(data, level, children){
		const statement = data.String
		return `${statement}/**/\n{\n${children}}`
	}

	stringifyContentfulElements(data, level, children){
		const {scope} = this
		const {Elements, FlowControl, Comment} = data
		const elements = this.stringifyElements(Elements)
		const content = this.#stringifyUserText(data)
		if(FlowControl == null)
			return `${scope}.write(${level},${elements},${content})\n${children}`
		const flowControl = this.stringifyFlowControl(FlowControl, level, children)
		return `${scope}.write(${level},${elements})\n${flowControl}\n`
	}

	#stringifyUserText(data){
		if(!data.String) return ''
		const {scope} = this
		const content = TextProcessor.toUserText(data.String)
		return `${scope}.text\`${content}\``
	}

	stringifyTextNode(data, level){
		const {scope} = this
		const {Flag} = data
		const flags = Flag.map(data => this.stringifyFlag(data))
		const content = this.#stringifyUserText(data, level)
		return `${scope}.write(${level},{flags:{${flags}}},${content})\n`
	}

	stringifyScript(data){
		return data.String + '\n'
	}

	stringifyDoctype(data, level, children){
		const {scope} = this
		const content = this.#stringifyUserText(data)
		return `${scope}.doctype(${level},${content})\n`
	}

	stringifyLine(data, level, children){
		if(!data) return children
		const {branch} = data
		if(data[branch] == null) throw Error('Syntax error')
		return this['stringify' + branch](data[branch], level, children)
	}

}
