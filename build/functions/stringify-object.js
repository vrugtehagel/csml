export default function stringifyObject(object){
	const seen = new WeakSet()
	return JSON.stringify(object, (key, value) => {
		if(seen.has(value)) return
		if(value && typeof value == 'object') seen.add(value)
		return value
	}, 4)
}
