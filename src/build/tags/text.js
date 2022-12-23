import stringifyObject from '../functions/stringify-object.js'

export default (parts, ...subs) => String.raw(parts, ...subs.map(sub => {
	if(sub == null) return ''
	if(typeof sub != 'object') return sub.toString()
	return stringifyObject(sub)
}))
