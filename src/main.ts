import { Plugin, TFile, Notice } from 'obsidian';
import { DataStore } from './data/store';
import { DatabaseIndex } from './data/index';
import { LinkResolver, LinkRenderer, EmbedManager } from './links';
import { TableView, BoardView, CalendarView, GanttView } from './views';
import { ToolBar, FilterBar } from './components';
import { DatabaseConfig, ViewType } from './data/types';
import { PrismTableSettings, DEFAULT_SETTINGS, PrismTableSettingTab } from './settings';

export default class PrismTablePlugin extends Plugin {
	settings!: PrismTableSettings;
	private dataStore!: DataStore;
	private databaseIndex!: DatabaseIndex;
	private linkResolver!: LinkResolver;
	private linkRenderer!: LinkRenderer;
	private embedManager!: EmbedManager;

	async onload() {
		console.log('Loading Prism Table plugin');

		// Load settings
		await this.loadSettings();

		// Initialize services
		this.dataStore = new DataStore(this.app);
		this.databaseIndex = new DatabaseIndex(this.app);
		this.linkResolver = new LinkResolver(this.app, this.databaseIndex);
		this.linkRenderer = new LinkRenderer(this.app, this.linkResolver);
		this.embedManager = new EmbedManager(this.app, this.linkResolver, this.dataStore);

		// Build database index
		await this.databaseIndex.buildIndex();

		// Register commands
		this.addCommand({
			id: 'create-table',
			name: 'Create Table',
			callback: () => this.createTable()
		});

		this.addCommand({
			id: 'open-table',
			name: 'Open Table',
			callback: () => this.openTable()
		});

		// Register code block processor for prism table
		this.registerMarkdownCodeBlockProcessor('prism-table', (source, el, ctx) => {
			this.renderTableCodeBlock(source, el, ctx);
		});

		// Register link processor
		this.registerMarkdownPostProcessor((el, ctx) => {
			this.processLinks(el, ctx);
		});

		// Add settings tab
		this.addSettingTab(new PrismTableSettingTab(this.app, this));

		// Add ribbon icon
		this.addRibbonIcon('table', 'Open Prism Table', () => {
			this.openTable();
		});

		// Add status bar item
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Prism Table Active');
	}

	onunload() {
		console.log('Unloading Prism Table plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createTable() {
		console.log('Creating table...');

		const fileName = `Table_${Date.now()}.md`;
		const content = this.getDefaultTableContent(fileName);

		try {
			const file = await this.app.vault.create(fileName, content);
			await this.app.workspace.openLinkText(file.path, '', true);
			new Notice('Table created successfully!');
		} catch (error) {
			console.error('Error creating table:', error);
			new Notice('Error creating table');
		}
	}

	async openTable() {
		console.log('Opening table...');

		const databases = this.databaseIndex.getAllDatabases();
		if (databases.length > 0 && databases[0]) {
			await this.app.workspace.openLinkText(databases[0].file.path, '', true);
		} else {
			new Notice('No tables found. Create a new table first.');
		}
	}

	private renderTableCodeBlock(source: string, el: HTMLElement, ctx: any) {
		const file = ctx.sourcePath ? this.app.vault.getAbstractFileByPath(ctx.sourcePath) : null;
		if (!(file instanceof TFile)) {
			el.createDiv({ text: 'Error: Could not find file', cls: 'prism-table-error' });
			return;
		}

		this.dataStore.loadDatabase(file).then(database => {
			if (!database) {
				el.createDiv({ text: 'Error: Not a table file', cls: 'prism-table-error' });
				return;
			}

			this.renderTableView(el, file, database);
		}).catch(error => {
			el.createDiv({ text: `Error: ${error.message}`, cls: 'prism-table-error' });
		});
	}

	private renderTableView(container: HTMLElement, file: TFile, database: DatabaseConfig) {
		const wrapper = container.createDiv({ cls: 'prism-table-wrapper' });

		// Create toolbar
		const toolbarEl = wrapper.createDiv({ cls: 'prism-table-toolbar' });
		const toolbar = new ToolBar(
			toolbarEl,
			database,
			(viewType: ViewType) => this.switchView(wrapper, file, database, viewType),
			() => this.addRow(file),
			() => this.addColumn(file)
		);

		// Create view container
		const viewContainer = wrapper.createDiv({ cls: 'prism-table-view-container' });

		// Render default view (table)
		this.renderView(viewContainer, file, database, 'table');
	}

	private renderView(container: HTMLElement, file: TFile, database: DatabaseConfig, viewType: ViewType) {
		container.empty();

		const viewConfig = database.views.find(v => v.type === viewType) || {
			id: `view_${viewType}`,
			name: `${viewType} View`,
			type: viewType,
			config: {}
		};

		let view;
		switch (viewType) {
			case 'table':
				view = new TableView(this.app, container, file, database, viewConfig, this.dataStore);
				break;
			case 'board':
				view = new BoardView(this.app, container, file, database, viewConfig, this.dataStore);
				break;
			case 'calendar':
				view = new CalendarView(this.app, container, file, database, viewConfig, this.dataStore);
				break;
			case 'gantt':
				view = new GanttView(this.app, container, file, database, viewConfig, this.dataStore);
				break;
			default:
				view = new TableView(this.app, container, file, database, viewConfig, this.dataStore);
		}

		view.render();
	}

	private switchView(container: HTMLElement, file: TFile, database: DatabaseConfig, viewType: ViewType) {
		const viewContainer = container.querySelector('.prism-table-view-container') as HTMLElement;
		if (viewContainer) {
			this.renderView(viewContainer, file, database, viewType);
		}
	}

	private async addRow(file: TFile) {
		console.log('Add row to:', file.path);
	}

	private async addColumn(file: TFile) {
		console.log('Add column to:', file.path);
	}

	private processLinks(el: HTMLElement, ctx: any) {
		// Process wiki-links
		const links = el.querySelectorAll('a.internal-link');
		links.forEach(link => {
			const href = link.getAttribute('data-href');
			if (href && this.linkResolver.isDatabaseLink(href)) {
				link.classList.add('prism-table-link');
			}
		});

		// Process embeds
		const embeds = el.querySelectorAll('.internal-embed');
		embeds.forEach(embed => {
			const src = embed.getAttribute('src');
			if (src) {
				this.embedManager.createEmbed(embed as HTMLElement, `![[${src}]]`);
			}
		});
	}

	private getDefaultTableContent(name: string): string {
		return `---
type: database
version: 1
created: ${new Date().toISOString()}
updated: ${new Date().toISOString()}
aliases: []
properties:
  - id: prop_title
    name: Title
    type: text
  - id: prop_status
    name: Status
    type: select
    options:
      - id: opt_todo
        name: To Do
        color: gray
      - id: opt_doing
        name: In Progress
        color: blue
      - id: opt_done
        name: Done
        color: green
  - id: prop_date
    name: Date
    type: date
views:
  - id: view_table
    name: Table View
    type: table
    config: {}
rows:
  - id: row_1
    cells:
      prop_title: First Task
      prop_status: opt_todo
      prop_date: ${new Date().toISOString().split('T')[0]}
---

# ${name}

This is a Prism Table file.
`;
	}
}
