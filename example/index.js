import { render } from '../mod.ts'

const url = new URL('./about.csml', import.meta.url)
const html = await render(url, { lastUpdate: new Date() })

console.log(html)
