export function generateId(prefix: string = ''): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 8);
	return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export function generateRowId(): string {
	return generateId('row');
}

export function generatePropertyId(): string {
	return generateId('prop');
}

export function generateViewId(): string {
	return generateId('view');
}

export function generateOptionId(): string {
	return generateId('opt');
}

export function isValidId(id: string): boolean {
	if (!id) return false;
	const parts = id.split('_');
	return parts.length >= 2;
}
