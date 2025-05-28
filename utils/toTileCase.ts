export function toTitleCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/[_-]+/g, " ")
		.split(" ")
		.map((word) => {
			if (word.length === 0) return "";
			return word[0].toUpperCase() + word.slice(1);
		})
		.join(" ");
}
