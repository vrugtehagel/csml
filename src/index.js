import { config } from './0-configure/index.ts'
import { Processor } from './1-process/index.ts'
import { Transpiler } from './2-transpile/index.ts'
import { Writer } from './3-write/index.ts'
import { transform, Context } from './4-transform/index.ts'
import { serialize } from './5-serialize/index.ts'

import { errors } from './errors/index.ts'
import { CSML, globalCSML } from './csml/index.ts'

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
