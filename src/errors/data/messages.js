export default {
	'invalid-transform-name': {
		type: TypeError,
		message: 'Transform names can only contain alphanumeric characters, underscores and dashes.'
	},
	'thing-already-exists': {
		type: TypeError,
		message: 'Cannot add {{thing}} "{{name}}" because it already exists.'
	},
}
