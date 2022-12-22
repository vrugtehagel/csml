import getSecret from '../functions/get-secret.js'
import createProxyWrapper from '../functions/create-proxy-wrapper.js'

export default function maskSecret(root, secret, onbreach){
	const amount = 2
	const falseSecrets = new Set([secret])
	while(falseSecrets.size < amount)
		falseSecrets.add(getSecret())
	falseSecrets.delete(secret)
	for(const falseSecret of falseSecrets){
		const value = createProxyWrapper(root[secret], {get: onbreach})
		Object.defineProperty(root, falseSecret, {value})
	}
}
