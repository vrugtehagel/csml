export default function getSecret(){
	return (Math.random() * 0xffffff | 0).toString(16)
}
