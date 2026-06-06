import { App, TFile } from 'obsidian';
import { DatabaseIndex } from '../data/index';

export class LinkAutocomplete {
	private app: App;
	private databaseIndex: DatabaseIndex;

	constructor(app: App, databaseIndex: DatabaseIndex) {
		this.app = app;
		this.databaseIndex = databaseIndex;
	}

	getSuggestions(query: string): LinkSuggestion[] {
		const suggestions: LinkSuggestion[] = [];
		const lowerQuery = query.toLowerCase();

		// Get all databases
		const databases = this.databaseIndex.getAllDatabases();
		for (const db of databases) {
			if (db.name.toLowerCase().includes(lowerQuery) ||
				db.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
				suggestions.push({
					type: 'database',
					name: db.name,
					aliases: db.aliases,
					file: db.file
				});
			}
		}

		// Get all files
		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			if (file.basename.toLowerCase().includes(lowerQuery)) {
				// Avoid duplicates with databases
				if (!suggestions.some(s => s.file.path === file.path)) {
					suggestions.push({
						type: 'file',
						name: file.basename,
						aliases: [],
						file: file
					});
				}
			}
		}

		return suggestions.slice(0, 10); // Limit to 10 suggestions
	}

	formatSuggestion(suggestion: LinkSuggestion): string {
		if (suggestion.type === 'database') {
			return `📊 ${suggestion.name}`;
		}
		return `📄 ${suggestion.name}`;
	}

	createLink(suggestion: LinkSuggestion, useAlias: boolean = false): string {
		if (useAlias && suggestion.aliases.length > 0) {
			return `[[${suggestion.name}|${suggestion.aliases[0]}]]`;
		}
		return `[[${suggestion.name}]]`;
	}
}

export interface LinkSuggestion {
	type: 'database' | 'file';
	name: string;
	aliases: string[];
	file: TFile;
}
