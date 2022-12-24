import stringifyObject from '../functions/stringify-object.js'

export default (parts, ...subs) => {
	const newParts = [...parts]
	newParts.raw = newParts
	return String.raw(newParts, ...subs.map(sub => {
		if(sub == null) return ''
		if(typeof sub != 'object') return sub.toString()
		return stringifyObject(sub)
	}))
}
