import { errors } from '../index.ts'


type Registration = {
	csml: any;
	args: any;
}

export default new class Manager {
	#availableId = 1
	#registrations: Map<number, Registration> = new Map()

	getNewId(){ return this.#availableId++ }

	register(id, things){
		const registration = this.#registrations.get(id) ?? {}
		const key = Object.keys(things).find(key => key in registration)
		if(key) errors.throw('manager-found-double-registration', {id, key})
		Object.assign(registration, things)
		this.#registrations.set(id, registration)
	}

	get(id, thing){
		if(!id) return
		return this.#registrations.get(id)?.[thing] ?? null
	}

}
