import { App, TFile } from 'obsidian';
import { DatabaseConfig, RowData, PropertyDef } from './types';

export class DataStore {
	private app: App;
	private cache: Map<string, DatabaseConfig> = new Map();

	constructor(app: App) {
		this.app = app;
	}

	async loadDatabase(file: TFile): Promise<DatabaseConfig | null> {
		// Check cache first
		if (this.cache.has(file.path)) {
			return this.cache.get(file.path)!;
		}

		try {
			const content = await this.app.vault.read(file);
			const frontmatter = this.parseFrontmatter(content);

			if (!frontmatter || frontmatter.type !== 'database') {
				return null;
			}

			const database = frontmatter as DatabaseConfig;
			this.cache.set(file.path, database);
			return database;
		} catch (error) {
			console.error('Error loading database:', error);
			return null;
		}
	}

	async saveDatabase(file: TFile, database: DatabaseConfig): Promise<void> {
		try {
			const content = await this.app.vault.read(file);
			const newContent = this.updateFrontmatter(content, database);
			await this.app.vault.modify(file, newContent);
			this.cache.set(file.path, database);
		} catch (error) {
			console.error('Error saving database:', error);
			throw error;
		}
	}

	async addRow(file: TFile, row: RowData): Promise<void> {
		const database = await this.loadDatabase(file);
		if (!database) {
			throw new Error('File is not a database');
		}

		database.rows.push(row);
		database.updated = new Date().toISOString();
		await this.saveDatabase(file, database);
	}

	async updateRow(file: TFile, rowId: string, data: Partial<RowData>): Promise<void> {
		const database = await this.loadDatabase(file);
		if (!database) {
			throw new Error('File is not a database');
		}

		const rowIndex = database.rows.findIndex(row => row.id === rowId);
		if (rowIndex === -1) {
			throw new Error('Row not found');
		}

		const existingRow = database.rows[rowIndex];
		if (existingRow) {
			database.rows[rowIndex] = {
				id: existingRow.id,
				cells: { ...existingRow.cells, ...data.cells }
			};
		}
		database.updated = new Date().toISOString();
		await this.saveDatabase(file, database);
	}

	async deleteRow(file: TFile, rowId: string): Promise<void> {
		const database = await this.loadDatabase(file);
		if (!database) {
			throw new Error('File is not a database');
		}

		database.rows = database.rows.filter(row => row.id !== rowId);
		database.updated = new Date().toISOString();
		await this.saveDatabase(file, database);
	}

	async addProperty(file: TFile, property: PropertyDef): Promise<void> {
		const database = await this.loadDatabase(file);
		if (!database) {
			throw new Error('File is not a database');
		}

		database.properties.push(property);
		database.updated = new Date().toISOString();
		await this.saveDatabase(file, database);
	}

	async deleteProperty(file: TFile, propertyId: string): Promise<void> {
		const database = await this.loadDatabase(file);
		if (!database) {
			throw new Error('File is not a database');
		}

		database.properties = database.properties.filter(p => p.id !== propertyId);
		// Remove property from all rows
		database.rows.forEach(row => {
			delete row.cells[propertyId];
		});
		database.updated = new Date().toISOString();
		await this.saveDatabase(file, database);
	}

	private parseFrontmatter(content: string): Partial<DatabaseConfig> | null {
		const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
		const match = content.match(frontmatterRegex);

		if (!match) {
			return null;
		}

		try {
			// Simple YAML parser for frontmatter
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

	private updateFrontmatter(content: string, database: DatabaseConfig): string {
		const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
		const match = content.match(frontmatterRegex);

		const newYaml = this.toYaml(database);
		const newFrontmatter = `---\n${newYaml}\n---`;

		if (match) {
			return content.replace(frontmatterRegex, newFrontmatter);
		} else {
			return `${newFrontmatter}\n\n${content}`;
		}
	}

	private toYaml(obj: any, indent: number = 0): string {
		let yaml = '';
		const prefix = '  '.repeat(indent);

		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const value = obj[key];
				if (Array.isArray(value)) {
					yaml += `${prefix}${key}:\n`;
					value.forEach(item => {
						if (typeof item === 'object') {
							yaml += `${prefix}  -\n${this.toYaml(item, indent + 2)}`;
						} else {
							yaml += `${prefix}  - ${this.formatYamlValue(item)}\n`;
						}
					});
				} else if (typeof value === 'object' && value !== null) {
					yaml += `${prefix}${key}:\n${this.toYaml(value, indent + 1)}`;
				} else {
					yaml += `${prefix}${key}: ${this.formatYamlValue(value)}\n`;
				}
			}
		}

		return yaml;
	}

	private formatYamlValue(value: any): string {
		if (typeof value === 'string') {
			if (value.includes(':') || value.includes('#') || value.includes('[') || value.includes('{')) {
				return `"${value}"`;
			}
			return value;
		}
		return String(value);
	}

	clearCache(): void {
		this.cache.clear();
	}

	clearCacheForFile(file: TFile): void {
		this.cache.delete(file.path);
	}
}
