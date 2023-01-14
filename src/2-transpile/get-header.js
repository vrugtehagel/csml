const url = new URL('../index.ts', import.meta.url)

export default (namespace => `
	const {csml, writer: ${namespace}} = await (async () => {
		const {CSML, Writer} = await import('${url}')
		const csml = new CSML(import.meta.url)
		const writer = new Writer
		return {csml, writer}
	})()
`)
