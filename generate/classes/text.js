export default class Text {
	#data = ''
	#cursor = 0
	#anchor = null
	#clipboard

	constructor(string){
		this.#data = string
	}

	get length(){ return this.#data.length }
	get previous(){ return this.#data[this.#cursor - 1] ?? '' }
	get current(){ return this.#data[this.#cursor] ?? '' }
	get next(){ return this.#data[this.#cursor + 1] ?? '' }
	get clipboard(){ return this.#clipboard }
	get selected(){
		if(this.#anchor == null) return ''
		return this.#data.substring(this.#cursor, this.#anchor)
	}

	[Symbol.toPrimitive](){ return this.#data }
	toString(){ return this.#data }
	clone(){ return new Text(this.#data) }

	select(){ this.#anchor = this.#cursor }
	deselect(){ this.#anchor = null }

	cancel(){
		this.#cursor = this.#anchor
		this.#anchor = null
	}

	cut(){
		if(this.#anchor == null) return
		const [min, max] = this.#anchor < this.#cursor
			? [this.#anchor, this.#cursor]
			: [this.#cursor, this.#anchor]
		this.#clipboard = this.#data.slice(min, max)
		this.#data = this.#data.slice(0, min) + this.#data.slice(max)
		this.#cursor = min
		this.#anchor = null
	}

	delete(){
		if(this.#anchor == null) return
		const [min, max] = this.#anchor < this.#cursor
			? [this.#anchor, this.#cursor]
			: [this.#cursor, this.#anchor]
		this.#data = this.#data.slice(0, min) + this.#data.slice(max)
		this.#cursor = min
		this.#anchor = null
	}

	read(amount){
		this.#cursor += amount
		if(this.#cursor > this.#data.length) this.#cursor = this.#data.length
		else if(this.#cursor < 0) this.#cursor = 0
	}

	readWhile(shape, dynamic){
		while(shape.test(this.current)) this.read(1)
	}

	moveTo(string, from = this.#cursor){
		const index = this.#data.indexOf(string, from)
		if(index == -1){
			this.#cursor = this.length
			return false
		}
		this.#cursor = index
		return true
	}

	startsWith(string, from = this.#cursor){
		return this.#data.startsWith(string, from)
	}

}
