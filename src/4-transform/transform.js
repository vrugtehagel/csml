import { config } from '../index.ts'

import Context from './context.ts'


export default function transform(root){
	root.descendants.forEach(node => {
		if(!('text' in node.data)) return
		const {text} = node.data
		const context = new Context(node)
		node.data.text = config.applyTransforms(text, context)
	})
	return root
}
