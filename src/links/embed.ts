import { App, TFile } from 'obsidian';
import { LinkResolver } from './resolver';
import { DataStore } from '../data/store';

export class EmbedManager {
	private app: App;
	private linkResolver: LinkResolver;
	private dataStore: DataStore;
	private embeds: Map<string, EmbedInstance> = new Map();

	constructor(app: App, linkResolver: LinkResolver, dataStore: DataStore) {
		this.app = app;
		this.linkResolver = linkResolver;
		this.dataStore = dataStore;
	}

	async createEmbed(container: HTMLElement, linkText: string): Promise<void> {
		const resolved = this.linkResolver.resolveLink(linkText);

		if (!resolved) {
			container.createDiv({
				text: `Embed not found: ${linkText}`,
				cls: 'embed-unresolved'
			});
			return;
		}

		if (resolved.type === 'database') {
			await this.createDatabaseEmbed(container, resolved.file);
		} else {
			await this.createFileEmbed(container, resolved.file);
		}
	}

	private async createDatabaseEmbed(container: HTMLElement, file: TFile): Promise<void> {
		const embedId = `embed-${file.path}-${Date.now()}`;

		const embedContainer = container.createDiv({
			cls: 'database-embed-container',
			attr: { 'data-embed-id': embedId }
		});

		// Add header
		const header = embedContainer.createDiv({ cls: 'embed-header' });
		header.createEl('h3', { text: file.basename, cls: 'embed-title' });

		// Add database content
		const content = embedContainer.createDiv({ cls: 'embed-content' });

		try {
			const database = await this.dataStore.loadDatabase(file);
			if (database) {
				this.renderDatabasePreview(content, database);
			} else {
				content.createDiv({ text: 'No database data found', cls: 'embed-empty' });
			}
		} catch (error) {
			content.createDiv({
				text: `Error loading database: ${error}`,
				cls: 'embed-error'
			});
		}

		// Store embed instance
		this.embeds.set(embedId, {
			id: embedId,
			file: file,
			container: embedContainer
		});
	}

	private async createFileEmbed(container: HTMLElement, file: TFile): Promise<void> {
		try {
			const content = await this.app.vault.read(file);
			const preview = content.substring(0, 300) + (content.length > 300 ? '...' : '');

			const embedContainer = container.createDiv({ cls: 'file-embed-container' });
			embedContainer.createEl('h4', { text: file.basename, cls: 'embed-title' });
			embedContainer.createDiv({ text: preview, cls: 'file-preview' });
		} catch (error) {
			container.createDiv({
				text: `Error loading file: ${error}`,
				cls: 'embed-error'
			});
		}
	}

	private renderDatabasePreview(container: HTMLElement, database: any): void {
		// Create a simple table preview
		const table = container.createEl('table', { cls: 'database-preview-table' });

		// Create header
		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		for (const prop of database.properties.slice(0, 5)) { // Limit to 5 columns
			headerRow.createEl('th', { text: prop.name });
		}

		// Create body
		const tbody = table.createEl('tbody');
		for (const row of database.rows.slice(0, 5)) { // Limit to 5 rows
			const tr = tbody.createEl('tr');
			for (const prop of database.properties.slice(0, 5)) {
				const cellValue = row.cells[prop.id] || '';
				tr.createEl('td', { text: String(cellValue) });
			}
		}

		// Add "View full database" link
		const viewLink = container.createEl('a', {
			text: 'View full database',
			cls: 'embed-view-link'
		});
		viewLink.addEventListener('click', () => {
			this.app.workspace.openLinkText(database.name, '', true);
		});
	}

	removeEmbed(embedId: string): void {
		const embed = this.embeds.get(embedId);
		if (embed) {
			embed.container.remove();
			this.embeds.delete(embedId);
		}
	}

	removeAllEmbeds(): void {
		for (const [embedId, embed] of this.embeds.entries()) {
			embed.container.remove();
		}
		this.embeds.clear();
	}
}

interface EmbedInstance {
	id: string;
	file: TFile;
	container: HTMLElement;
}
