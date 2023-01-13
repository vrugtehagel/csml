import { config, errors } from '../index.ts'

const defineTag = ({each = sub => sub ?? '', accept, validate} = {}) => {
	const tag = (parts, ...subs) => {
		const newParts = [...parts]
		newParts.raw = newParts
		if(subs.some(item => typeof item?.then == 'function'))
			return Promise.all(subs).then(subs => tag(parts, ...subs))
		if(parts.length == 2 && !parts[0] && !parts[1] && accept?.(subs[0]))
			return sub
		const newSubs = subs.map(sub => each(sub))
		const result = String.raw(newParts, ...newSubs)
		validate?.(result, parts, ...subs)
		return result
	}
	return tag
}

export default {
	doctype: defineTag(),
	tagName: defineTag(),
	flagArguments: defineTag(),
	text: defineTag(),
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
