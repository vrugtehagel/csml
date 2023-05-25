import { config, errors } from '../index.js'

const defineTag = ({each = sub => sub ?? '', accept, validate} = {}) => {
	const tag = (parts, ...subs) => {
		const raw = [...parts]
		if(subs.some(item => typeof item?.then == 'function'))
			return Promise.all(subs).then(subs => tag(parts, ...subs))
		if(parts.length == 2 && !parts[0] && !parts[1] && accept?.(subs[0]))
			return subs[0]
		const newSubs = subs.map(sub => each(sub))
		const result = String.raw({raw}, ...newSubs)
		validate?.(result, parts, ...subs)
		return result
	}
	return tag
}

export default {
	doctype: defineTag(),
	tagName: defineTag(),
	flagArguments: defineTag(),
	text: defineTag({
		each: sub => {
			if(sub == null) return sub ?? ''
			if(typeof sub != 'object') return sub
			const seen = new Set
			return JSON.stringify(sub, (key, value) => {
				if(!value || typeof value != 'object') return value
				if(typeof value == 'function') return
				if(seen.has(value)) return '[Circular]'
				seen.add(value)
				return value
			})
		}
	}),
	id: defineTag({accept: value => value == null}),
	className: defineTag({
		each: sub => {
			if(sub == null) return ''
			if(typeof sub != 'object') return sub
			if(Array.isArray(sub)) return sub.join(' ')
			return Object.keys(sub).filter(([key, value]) => value).join(' ')
		}
	}),
	attributeName: defineTag({
		accept: value => value && typeof value == 'object'
	}),
	attributeValue: defineTag({accept: value => value == null}),
	flagName: defineTag({
		validate: (value, parts, ...subs) => {
			if(parts.length == 1) return
			if(!config.isFlagPreformatted(value)) return
			errors.warn('interpolated-preformatted-flag', {name: value})
		}
	})
}
