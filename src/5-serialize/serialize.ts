const voidTags = new Set([
	'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
	'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
])

export default function serialize(node){
	const {data} = node
	if(!data) return node.children.map(node => serialize(node)).join('')
	if('doctype' in data) return `<!DOCTYPE ${data.doctype.trim()}>`
	if('text' in data) return data.text
	const {tagName, attributes} = data
	const attributeString = Object.entries(attributes)
		.map(([name, value]) => serializeAttribute(name, value))
		.join('')
	const openingTag = `<${tagName}${attributeString}>`
	const closingTag = voidTags.has(tagName) ? '' : `</${tagName}>`
	const children = node.children.map(node => serialize(node)).join('')
	return openingTag + children + closingTag
}

function serializeAttribute(name, value){
	if(name == 'class') value = value.trim().replaceAll(/\s{2,}/g, ' ')
	if(!value) return name
	if(!/[ ='"`<>]/.test(value)) return ` ${name}=${value}`
	return ` ${name}="${value.replaceAll('"', '&quot;')}"`
}
