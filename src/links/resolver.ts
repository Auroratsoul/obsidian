import { App, TFile } from 'obsidian';
import { DatabaseIndex } from '../data/index';

export class LinkResolver {
	private app: App;
	private databaseIndex: DatabaseIndex;

	constructor(app: App, databaseIndex: DatabaseIndex) {
		this.app = app;
		this.databaseIndex = databaseIndex;
	}

	resolveLink(linkText: string): ResolvedLink | null {
		// Parse wiki-link syntax
		const wikiLinkMatch = linkText.match(/^\[\[([^\]|]+)(\|([^\]]+))?\]\]$/);
		if (!wikiLinkMatch) {
			return null;
		}

		const target = wikiLinkMatch[1];
		const alias = wikiLinkMatch[3] || null;

		if (!target) {
			return null;
		}

		// Try to find database by name
		const databaseInfo = this.databaseIndex.findByName(target);
		if (databaseInfo) {
			return {
				type: 'database',
				file: databaseInfo.file,
				name: databaseInfo.name,
				alias: alias
			};
		}

		// Try to find file by path
		const file = this.app.metadataCache.getFirstLinkpathDest(target, '');
		if (file) {
			return {
				type: 'file',
				file: file,
				name: file.basename,
				alias: alias
			};
		}

		return null;
	}

	isDatabaseLink(linkText: string): boolean {
		const resolved = this.resolveLink(linkText);
		return resolved?.type === 'database';
	}

	getDatabaseFromLink(linkText: string): TFile | null {
		const resolved = this.resolveLink(linkText);
		if (resolved?.type === 'database') {
			return resolved.file;
		}
		return null;
	}
}

export interface ResolvedLink {
	type: 'database' | 'file';
	file: TFile;
	name: string;
	alias: string | null;
}
