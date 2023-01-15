import { config } from './0-configure/index.js'
import { Processor } from './1-process/index.js'
import { Transpiler } from './2-transpile/index.js'
import { Writer } from './3-write/index.js'
import { transform, Context } from './4-transform/index.js'
import { serialize } from './5-serialize/index.js'

import { errors } from './errors/index.js'
import { CSML, globalCSML } from './csml/index.js'

config.resetToDefaults()
Writer.setFinalizers(transform, serialize)

export {
	config,
	Processor,
	Transpiler,
	Writer,
	transform,
	Context,
	serialize,

	errors,
	CSML,
	globalCSML
}
