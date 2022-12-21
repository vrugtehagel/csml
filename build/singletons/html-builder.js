import voidTags from '../data/void-tags.js'

export default new class HTMLBuilder {

	getOpeningTag(element){
		const {tagName} = element
		if(!tagName) return ''
		const attributes = Object.entries(element.attributes)
			.map(([name, value]) => this.getAttribute(name, value))
			.join('')
		return `<${tagName}${attributes}>`
	}

	getClosingTag(element){
		const {tagName, flags} = element
		if(!tagName) return ''
		if(voidTags.includes(tagName)) return ''
		if('void' in flags) return ''
		return `</${tagName}>`
	}

	getAttribute(name, value){
		if(name == 'id' && !value) return ''
		if(name == 'class') value = value.replaceAll(/\s{2,}/g, ' ').trim()
		if(value == null) return ''
		if(/[\t\n\f \/>"'=]/.test(name)) throw Error(`Bad attribute "${name}"`)
		if(!value) return ` ${name}`
		if(!/[ ='"`<>]/.test(value)) return ` ${name}=${value}`
		return ` ${name}="${value.replaceAll('"', '&quot;')}"`
	}

}
