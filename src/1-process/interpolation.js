export default class Interpolation {
	static escapeString(string){ return string.replaceAll(/[\$\\`]/g, '\\$&') }

	#data = ['']

	get isInterpolation(){ return true }
	get isString(){ return this.#data.length == 1 }
	get isEmpty(){ return this.isString && !this.#data[0] }
	get isValue(){
		return this.#data.length == 3 && !this.#data[0] && !this.#data[2]
	}
	get string(){ return this.isString ? this.#data[0] : null }

	addString(string){
		this.#data[this.#data.length - 1] += string
	}

	addValue(value){
		value = value.trim() || 'undefined'
		this.#data.push(value, '')
	}

	concat(interpolation){
		const [first, ...other] = interpolation.#data
		this.addString(first)
		this.#data.push(...other)
	}

	toString(){
		let result = Interpolation.escapeString(this.#data[0])
		for(let index = 1; index < this.#data.length; index += 2){
			const interpolation = this.#data[index]
			const string = Interpolation.escapeString(this.#data[index + 1])
			result += `\${${interpolation}}${string}`
		}
		return '`' + result + '`'
	}

}
