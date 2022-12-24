export default (parts, ...subs) => {
	const newParts = [...parts]
	newParts.raw = newParts
	return String.raw(newParts, ...subs.map(sub => sub ?? ''))
}
