import { csml } from '../mod.ts'

const url = new URL('./about.csml', import.meta.url)
const html = await csml.render(url, { lastUpdate: new Date() })

console.log(html)
