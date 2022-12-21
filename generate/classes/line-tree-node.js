import TreeNode from '../classes/tree-node.js'
import TextProcessor from '../classes/text-processor.js'
import parser from '../singletons/parser.js'
import generator from '../singletons/generator.js'

export default class LineTreeNode extends TreeNode {
	#processor
	#level = 0
	#output = null
	#data
	#isRoot = false

	static getRoot(){
		const root = new LineTreeNode('')
		root.#level = -1
		root.#isRoot = true
		return root
	}

	constructor(content){
		super()
		this.#processor = new TextProcessor(content)
		this.#level = this.#processor.processIndentation()
		if(this.#processor.done) this.#level = Infinity
	}

	get data(){
		if(this.#data === undefined) this.parse()
		return this.#data
	}

	toString(){ return this.#processor.toString() }

	addAdjacentNode(line){
		let node = this
		while(line.#level <= node.#level) node = node.parentNode
		node.addChild(line)
		return line
	}

	flatten(){
		if(this.length == 0) return ''
		const descendants = this.descendants
		const levels = descendants.map(node => node.#level)
		const minLevel = Math.min(...levels)
		const getLevel = node =>
			Number.isFinite(node.#level) ? node.#level - minLevel : 0
		const result = descendants
			.map(node => ' '.repeat(getLevel(node)) + node.toString())
			.join('\n')
		this.empty()
		return result
	}

	shouldFlatten(){
		const {data} = this
		if(!data) return false
		if(data.branch == 'Script') return true
		if(data.branch == 'FlowControl') return false
		if(data.branch == 'TextNode') return true
		const {Elements} = data[data.branch]
		const elements = [Elements.Element, ...Elements.DescendantElement]
		const flattenTagNames = ['style', 'script']
		const flattenFlags = ['preformatted', 'indent', 'text-only']
		return elements.some(({TagName, Flag}) => {
			if(flattenTagNames.includes(TagName)) return true
			return Flag.some(({FlagName}) => flattenFlags.includes(FlagName))
		})
	}

	withdraw(){
		const {parentNode} = this.parentNode
		const {index, children} = this
		if(index == -1) throw Error('Node not child of parent')
		const path = [this.previousSibling ?? this.parentNode]
		let node
		while(node = path[0].lastChild) path.unshift(node)
		for(const child of children)
			path.find(node => node.#level < child.#level).addChild(child)
		this.remove()
	}

	parse(){
		if(this.#data !== undefined) return false
		this.#data = parser.parse('Line', this.#processor)
		if(this.#data && this.#data.branch != 'Comment') return false
		if(!this.#processor.done) throw Error(`Syntax error`)
		if(this.#isRoot) return false
		this.withdraw()
		return true
	}

	generate(){
		if(this.#output != null) return this.#output
		const {data} = this
		if(this.shouldFlatten()) data[data.branch].String += this.flatten()
		for(let index = 0; index < this.length; index++)
			index -= this.children[index].parse()
		const content = this.children.map(child => child.generate()).join('')
		const level = this.#level
		this.#output = generator.stringifyLine(data, level, content)
		return this.#output
	}

}
