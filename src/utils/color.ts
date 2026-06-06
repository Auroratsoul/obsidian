export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result || !result[1] || !result[2] || !result[3]) {
		return null;
	}
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	};
}

export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map(x => {
		const hex = x.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}).join('');
}

export function lightenColor(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const amount = Math.round(2.55 * percent);
	const r = Math.min(255, rgb.r + amount);
	const g = Math.min(255, rgb.g + amount);
	const b = Math.min(255, rgb.b + amount);

	return rgbToHex(r, g, b);
}

export function darkenColor(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const amount = Math.round(2.55 * percent);
	const r = Math.max(0, rgb.r - amount);
	const g = Math.max(0, rgb.g - amount);
	const b = Math.max(0, rgb.b - amount);

	return rgbToHex(r, g, b);
}

export function getContrastColor(hex: string): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return '#000000';

	const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
	return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function getTagColor(colorName: string): string {
	const colorMap: Record<string, string> = {
		'gray': '#e8e8e8',
		'brown': '#e4d8c0',
		'orange': '#fadec9',
		'yellow': '#fdecc8',
		'green': '#dbeddb',
		'blue': '#d3e5ef',
		'purple': '#e8deee',
		'pink': '#f5e0e9',
		'red': '#ffe2dd',
		'default': '#e8e8e8'
	};

	return colorMap[colorName] || colorMap['default'] || '#e8e8e8';
}

export function getTagTextColor(colorName: string): string {
	const colorMap: Record<string, string> = {
		'gray': '#37352f',
		'brown': '#6b4c2a',
		'orange': '#8a4e24',
		'yellow': '#7a5e1a',
		'green': '#2d6a2e',
		'blue': '#24568a',
		'purple': '#5b3d8a',
		'pink': '#8a3d5e',
		'red': '#8a3333',
		'default': '#37352f'
	};

	return colorMap[colorName] || colorMap['default'] || '#37352f';
}
