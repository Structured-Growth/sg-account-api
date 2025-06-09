export function getEnumValues(enumType): (string | number)[] {
	let result = [];
	for (let enumMember in enumType) {
		result.push(enumMember);
	}
	return result;
}
