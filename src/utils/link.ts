export function parseWikiLink(linkText: string): WikiLink | null {
	const match = linkText.match(/^\[\[([^\]|]+)(\|([^\]]+))?\]\]$/);
	if (!match || !match[1]) {
		return null;
	}

	return {
		target: match[1],
		alias: match[3] || null
	};
}

export function isWikiLink(text: string): boolean {
	return /^\[\[([^\]|]+)(\|([^\]]+))?\]\]$/.test(text);
}

export function isEmbedLink(text: string): boolean {
	return /^!\[\[([^\]|]+)(\|([^\]]+))?\]\]$/.test(text);
}

export function parseEmbedLink(linkText: string): WikiLink | null {
	const match = linkText.match(/^!\[\[([^\]|]+)(\|([^\]]+))?\]\]$/);
	if (!match || !match[1]) {
		return null;
	}

	return {
		target: match[1],
		alias: match[3] || null
	};
}

export function createWikiLink(target: string, alias?: string): string {
	if (alias) {
		return `[[${target}|${alias}]]`;
	}
	return `[[${target}]]`;
}

export function createEmbedLink(target: string, alias?: string): string {
	if (alias) {
		return `![[${target}|${alias}]]`;
	}
	return `![[${target}]]`;
}

export function extractLinksFromText(text: string): string[] {
	const linkRegex = /\[\[([^\]|]+)(\|[^\]]+)?\]\]/g;
	const links: string[] = [];
	let match;

	while ((match = linkRegex.exec(text)) !== null) {
		if (match[1]) {
			links.push(match[1]);
		}
	}

	return links;
}

export function extractEmbedsFromText(text: string): string[] {
	const embedRegex = /!\[\[([^\]|]+)(\|[^\]]+)?\]\]/g;
	const embeds: string[] = [];
	let match;

	while ((match = embedRegex.exec(text)) !== null) {
		if (match[1]) {
			embeds.push(match[1]);
		}
	}

	return embeds;
}

export interface WikiLink {
	target: string;
	alias: string | null;
}
