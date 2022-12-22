export default function createProxyWrapper(target, traps){
	const handler = {}
	for(const [key, trap] of Object.entries(traps))
		handler[key] = fixReturnValue(key, trap)
	return new Proxy(target, handler)
}

const fixReturnValue = (key, callback) => (...args) => {
	callback(...args)
	return Reflect[key](...args)
}
