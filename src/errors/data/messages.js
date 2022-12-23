export default {
	'invalid-transform-name': {
		type: TypeError,
		message: 'Transform names can only contain alphanumeric characters, underscores and dashes.'
	},
	'thing-already-exists': {
		type: TypeError,
		message: 'Cannot add {{thing}} "{{name}}" because it already exists.'
	},
	'duplicate-uuid': {
		type: Error,
		message: 'Two generated UUID happened to be identical. Please try again.'
	},
	'tabsize-too-large': {
		type: TypeError,
		message: 'Invalid tab size in ":indent({args})". Tab size must not exceed 10.'
	},
	'unexpected-orphan': {
		type: Error,
		message: 'A node could not be removed, because it is not a child of its parent.'
	},
	'illegal-constructor': {
		type: TypeError,
		message: 'Illegal constructor'
	},
	'unexpected': {
		type: Error,
		message: 'Unexpected {{type}} "{{thing}}".'
	},
	'expected': {
		type: Error,
		message: 'Expected {{type}} "{{thing}}", none found.'
	},
	'empty-token': {
		type: Error,
		message: 'Parsed a token of type {{token}}, but it contents were null.'
	},

}
