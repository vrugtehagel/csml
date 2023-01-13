const url = new URL('../index.ts', import.meta.url)

export default (namespace => `
	export default await ${namespace}.finalize()
`)
