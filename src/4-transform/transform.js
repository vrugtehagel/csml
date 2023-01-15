import { config } from '../index.js'

import Context from './context.js'


export default function transform(root){
	root.descendants.forEach(node => {
		if(!('text' in node.data)) return
		const {text} = node.data
		const context = new Context(node)
		node.data.text = config.applyTransforms(text, context)
	})
	return root
}
