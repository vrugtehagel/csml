import { config, errors } from '../index.ts'


export default function normalize(node){
	const {data} = node
	if('doctype' in data) return node

	const flags = {}
	for(const item of data.flags) flags[item.name] = item.value ?? null
	data.flags = flags
	for(const name of Object.keys(flags))
		if(!config.flagExists(name)) errors.throw('unknown-flag-name', {name})
	if('text' in data) return node

	const {tagName} = data
	const attributes = {}
	for(const item of data.attributes){
		if(typeof item.name != 'object') attributes[item.name] = item.value
		else if(!item.name) continue
		else if('value' in item) continue
		else Object.assign(attributes, item.name)
	}
	attributes.id = data.id
	if(!attributes.id) delete attributes.id
	if('class' in attributes)
		attributes.class += ' ' + data.classNames.join('')
	else attributes.class = data.classNames.join('')
	attributes.class = attributes.class.trim()
	if('class' in attributes) attributes.class = attributes.class.trim()
	if(!attributes.class) delete attributes.class
	delete data.id
	delete data.classNames
	for(const [key, value] of Object.entries(attributes)){
		if(value == null) delete attributes[key]
		else if(typeof value != 'string') attributes[key] = `${value}`
	}
	data.attributes = attributes
	for(const name of Object.keys(attributes))
		if(/[\s'">/=\x00-\x20\x7F]/.test(name) || !name)
			errors.throw('invalid-attribute-name', {name})

	if(!/[a-z][-\w\u{B7}\u{C0}-\u{EFFFF}]*/ui.test(tagName))
		errors.throw('invalid-tag-name', {name: tagName})
	return node
}
