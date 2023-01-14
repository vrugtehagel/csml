export default class TreeNode {
	#children = []
	#parentNode

	get parentNode(){ return this.#parentNode }
	get path(){ return [this, ...(this.parentNode?.path ?? [])] }
	get root(){ return this.#parentNode ? this.#parentNode.root : this }
	get children(){ return [...this.#children] }
	get descendants(){
		const children = this.#children
		const grandChildren = children.flatMap(child => child.descendants)
		return [...children, ...grandChildren]
	}

	constructor(data){
		this.data = data
	}

	append(node){
		this.#children.push(node)
		node.#parentNode = this
	}

}
