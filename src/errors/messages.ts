export default {
	'self': {
		type: Error,
		message: 'Tried to {action} ({name}) but it wasn\'t defined'
	},
	'never': {
		type: Error,
		message: 'This is a hypothetical error. It should never happen.',
		help: 'If it keeps happening, please file an issue for it.'
	},
	'flag-already-exists': {
		type: TypeError,
		message: 'Cannot add flag "{name}", because it already exists.'
	},
	'no-empty-transform-name': {
		type: TypeError,
		message: 'Flag and transform names cannot be empty.'
	},
	'transform-already-exists': {
		type: TypeError,
		message: 'Cannot add transform "{name}", because it already exists.'
	},
	'unended-interpolation': {
		type: SyntaxError,
		message: 'This interpolation needs a closing }}.'
	},
	'expected-token': {
		type: SyntaxError,
		message: 'Expected {value} here, but got something else.'
	},
	'manager-found-double-registration': {
		type: TypeError,
		message: 'Cannot re-register {key} under id {id}.',
		help: 'If this is not you doing it on purpose, please file an issue.'
	},
	'multiple-doctypes': {
		type: SyntaxError,
		message: 'One a single doctype is allowed, but more were found.'
	},
	'illegal-constructor': {
		type: TypeError,
		message: 'Illegal constructor.'
	},
	'interpolated-preformatted-flag': {
		type: TypeError,
		message: 'Interpolation was used on a textual flag, :{name}.',
		help: 'Textual flags need to be known at parse time to have an effect.'
	},
	'invalid-attribute-name': {
		type: TypeError,
		message: 'Found an invalid attribute: "{name}".'
	},
	'invalid-tag-name': {
		type: TypeError,
		message: 'The tag name "{name}" is invalid.'
	},
	'unknown-flag-name': {
		type: TypeError,
		message: 'Encountered unregistered flag "{name}".',
		help: 'If it was intentional, register it first with addFlag().'
	},
	'indent-tabsize-out-of-range': {
		type: RangeError,
		message: 'The tabSize argument in :indent() must be between 0 and 10.'
	}
}
