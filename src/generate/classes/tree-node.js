export default class TreeNode {
	#parentNode = null
	#children = []

	get length(){ return this.#children.length }
	get parentNode(){ return this.#parentNode ?? null }
	get firstChild(){ return this.#children[0] ?? null }
	get lastChild(){ return this.#children.at(-1) ?? null }
	get lastDescendant(){ return this.lastChild?.lastDescendant ?? this }
	get children(){ return [...this.#children] }
	get descendants(){ return [...this].slice(1) }
	get index(){ return this.#parentNode.#children.indexOf(this) }
	get previousSibling(){ return this.#parentNode.#children[this.index - 1] ?? null }
	get root(){ return this.#parentNode?.root ?? this }

	*[Symbol.iterator](){
		yield this
		for(const child of this.#children) yield* child
	}

	addChild(child){
		child.#parentNode?.removeChild(child)
		this.#children.push(child)
		child.#parentNode = this
	}

	remove(){
		this.#parentNode?.removeChild(this)
	}

	removeChild(child){
		const index = this.#children.indexOf(child)
		if(index == -1) return
		this.#children.splice(index, 1)
		child.#parentNode = null
	}

	empty(){
		for(const child of this.#children) child.#parentNode = null
		this.#children = []
	}

}
