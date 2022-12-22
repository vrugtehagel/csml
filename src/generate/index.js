import LineTreeNode from './classes/line-tree-node.js'
import generator from './singletons/generator.js'

export default function generate(source, {csmlArgs}){
	const lines = source.split(/\r?\n/)
	const root = LineTreeNode.getRoot()
	let line = root
	for(const content of lines)
		line = line.addAdjacentNode(new LineTreeNode(content))
	const header = generator.getHeader(csmlArgs)
	const main = root.generate()
	const footer = generator.getFooter()
	return `${header}${main}${footer}`
}
