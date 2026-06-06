import { App, TFile } from 'obsidian';
import { DatabaseConfig } from './types';

export class DatabaseIndex {
	private app: App;
	private index: Map<string, DatabaseInfo> = new Map();

	constructor(app: App) {
		this.app = app;
	}

	async buildIndex(): Promise<void> {
		this.index.clear();

		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			try {
				const content = await this.app.vault.read(file);
				const frontmatter = this.parseFrontmatter(content);

				if (frontmatter && frontmatter.type === 'database') {
					this.index.set(file.path, {
						file,
						name: frontmatter.name || file.basename,
						aliases: frontmatter.aliases || [],
						created: frontmatter.created || '',
						updated: frontmatter.updated || ''
					});
				}
			} catch (error) {
				console.error(`Error indexing file ${file.path}:`, error);
			}
		}
	}

	findByName(name: string): DatabaseInfo | null {
		for (const info of this.index.values()) {
			if (info.name === name || info.aliases.includes(name)) {
				return info;
			}
		}
		return null;
	}

	findByPath(path: string): DatabaseInfo | null {
		return this.index.get(path) || null;
	}

	getAllDatabases(): DatabaseInfo[] {
		return Array.from(this.index.values());
	}

	private parseFrontmatter(content: string): Partial<DatabaseConfig> | null {
		const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
		const match = content.match(frontmatterRegex);

		if (!match) {
			return null;
		}

		try {
			const yamlContent = match[1];
			if (!yamlContent) {
				return null;
			}

			const result: any = {};

			yamlContent.split('\n').forEach(line => {
				const colonIndex = line.indexOf(':');
				if (colonIndex > 0) {
					const key = line.substring(0, colonIndex).trim();
					const value = line.substring(colonIndex + 1).trim();
					result[key] = this.parseYamlValue(value);
				}
			});

			return result;
		} catch (error) {
			console.error('Error parsing frontmatter:', error);
			return null;
		}
	}

	private parseYamlValue(value: string): any {
		if (value === 'true') return true;
		if (value === 'false') return false;
		if (value === 'null') return null;
		if (!isNaN(Number(value))) return Number(value);
		if (value.startsWith('"') && value.endsWith('"')) {
			return value.slice(1, -1);
		}
		return value;
	}
}

export interface DatabaseInfo {
	file: TFile;
	name: string;
	aliases: string[];
	created: string;
	updated: string;
}
