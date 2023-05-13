import { config } from '../index.js'

import Interpolation from './interpolation.js'

export default {
	indentation: {regex: /^\n+ */},
	whitespace: {regex: /^[ \t]+/},
	eol: {regex: /^(?=\n)/},
	eof: {regex: /^$/},
	string: {regex: /^.*/},
	text: {regex: /^.*/, interpolable: true},
	ident: {regex: /^[-\w\u{B7}\u{C0}-\u{EFFFF}]*/u, interpolable: true},
	simpleIdent: {regex: /^[-\w\u{7F}-\u{EFFFF}]+/u},
	arguments: {regex: /^[^)]*/, interpolable: true},
	simpleArguments: {regex: /^[^)]*/},
	quote: {regex: /^(?:'|"|(?=[^ '"`<>=\]]))/},
	singleQuotedString:
		{regex: /^[^'\n\\]*(?:(?:\\.)[^'\n\\])*/, interpolable: true},
	doubleQuotedString:
		{regex: /^[^"\n\\]*(?:(?:\\.)[^"\n\\])*/, interpolable: true},
	unquotedString: {regex: /^[^ '"`<>=\]]*/, interpolable: true},
	level: processor => {
		if(!processor.if('indentation')) return
		const indentation = processor.get()
		const spaceIndex = indentation.indexOf(' ')
		const level = spaceIndex == -1 ? 0 : indentation.length - spaceIndex
		processor.level = level
		return true
	},
	blockText: processor => {
		const {level} = processor
		const blockIndentation = {regex: new RegExp(`^\n+ {${level + 1}}`)}
		const result = new Interpolation
		while(true){
			processor.try('text')
			processor.matched()
			if(processor.matched()) result.concat(processor.get())
			processor.try(blockIndentation)
			if(!processor.matched()) break
			const indentation = processor.get()
			const newlines = indentation.slice(0, indentation.length - level)
			result.addString(newlines)
		}
		if(result.isEmpty) return
		return result
	},
	blockString: processor => {
		const {level} = processor
		const blockIndentation = {regex: new RegExp(`^\n+ {${level + 1}}`)}
		let result = ''
		while(true){
			processor.try('string')
			if(processor.matched()) result += processor.get()
			processor.try(blockIndentation)
			if(!processor.matched()) break
			const indentation = processor.get()
			const newlines = indentation.slice(0, indentation.length - level)
			result += newlines
		}
		if(result == '') return
		return result
	},
	doctype: processor => processor
		.if('!DOCTYPE')
		?.expect('whitespace')
		.expect('text')
		.get(),
	script: processor => processor.if('@script')?.try('blockString').get(),
	statement: processor => processor.if('@')?.expect('string').get(),
	id: processor => processor.if('#')?.expect('ident').get(),
	className: processor => processor.if('.')?.expect('ident').get(),
	attribute: processor => {
		if(!processor.if('[')) return
		processor.open()
		processor.try('whitespace')
		processor.expect('ident').as('name')
		processor.try('whitespace')
		processor.expect('=', ']')
		if(processor.matched() == ']') return processor.close()
		processor.try('whitespace')
		processor.expect('quote')
		const quote = processor.get()
		if(processor.if(quote))
			return processor.try('whitespace').expect(']').close()
		if(quote == '\'') processor.expect('singleQuotedString')
		else if(!quote) processor.expect('unquotedString')
		else processor.expect('doubleQuotedString')


		processor.as('value')
		if(quote) processor.expect(quote)
		processor.try('whitespace')
		processor.expect(']')
		return processor.close()
	},
	flag: processor => {
		if(!processor.if(':')) return
		processor.open()
		processor.expect('ident').as('name')
		processor.try('(')
		if(!processor.matched()) return processor.close()
		processor.try('arguments').as('arguments')
		processor.expect(')')
		return processor.close()
	},
	simpleFlag: processor => {
		processor.try(':')
		const isComplete = processor.matched()
		processor.open()
		processor.expect('simpleIdent').as('name')
		if(!isComplete) return processor.expect('eof').close()
		processor.expect('(', 'eof')
		if(processor.matched() == 'eof') return processor.close()
		processor.try('simpleArguments').as('arguments')
		processor.expect(')')
		processor.expect('eof')
		return processor.close()

	},
	modifier: processor => {
		const modifiers = ['id', 'className', 'attribute', 'flag']
		processor.open()
		processor.try(...modifiers).as('value')
		if(processor.matched())
			return processor.write(processor.matched()).as('type').close()
		processor.try('eol')
		if(!processor.matched()) return processor.abort()
		const {level} = processor
		processor.try('\n' + ' '.repeat(level) + '&')
		if(!processor.matched()) return processor.abort()
		processor.expect(...modifiers).as('value')
		processor.write(processor.matched()).as('type')
		return processor.close()
	},
	modifiers: processor => {
		processor.open()
		while(true){
			processor.try('modifier')
			if(!processor.matched()) break
			const {value, type} = processor.get()
			if(type == 'id') processor.write(value).as('id')
			else processor.write(value).into(`${type}s`)
		}
		const result = processor.close()
		if(Object.keys(result).length == 0) return
		return result
	},
	element: processor => {
		processor.try('ident')
		if(!processor.matched()) return
		processor.open()
		processor.as('tagName')
		while(processor.matched()) processor.try('modifiers').merge()
		const data = processor.peek()
		const textType = config.isTokenPreformatted(data)
			? 'blockText'
			: 'text'
		processor.try('whitespace')
		processor.expect('descendant', 'statement', textType, 'eol')
		const matched = processor.matched()
		if(matched == 'eol') return processor.close()
		if(matched == textType) return processor.as('text').close()
		return processor.as(matched).close()
	},
	descendant: processor => processor
		.if('>')
		?.try('whitespace')
		.expect('element')
		.get(),
	textNode: processor => {
		processor.try('flag')
		if(!processor.matched()) return
		processor.open()
		processor.into('flags')
		while(processor.matched()) processor.try('flag').into('flags')
		processor.try('whitespace')
		const data = processor.peek()
		const textType = config.isTokenPreformatted(data)
			? 'blockText'
			: 'text'
		processor.expect('eol', textType)
		const matched = processor.matched()
		if(matched == 'eol') return processor.close()
		if(matched == textType) return processor.as('text').close()
		return processor.as(matched).close()
	},
	any: processor => {
		processor.try('level')
		processor.try('eof')
		if(processor.matched()) return
		processor.open()
		processor.expect('doctype', 'script', 'statement', 'textNode',
			'element')
		const matched = processor.matched()
		processor.as(matched)
		processor.write(processor.level).as('level')
		return processor.close()
	},
	all: processor => {
		processor.open()
		do processor.try('any').into('tokens')
		while(processor.matched())
		return processor.close().tokens ?? []
	}
}

