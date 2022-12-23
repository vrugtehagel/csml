export default function stringifyFlatObject(object){
	if(object == null) return 'null'
	const result = {...object}
	for(const [name, value] of Object.entries(result))
		result[name] = value == null ? null : `${value}`
	return JSON.stringify(result)
}
