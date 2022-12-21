export default (parts, ...subs) => String.raw(parts, ...subs.map(sub => {
	return sub ?? ''
}))
