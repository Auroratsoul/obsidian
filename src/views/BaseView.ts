import { App, TFile } from 'obsidian';
import { DatabaseConfig, ViewConfig } from '../data/types';
import { DataStore } from '../data/store';

export abstract class BaseView {
	protected app: App;
	protected container: HTMLElement;
	protected file: TFile;
	protected database: DatabaseConfig;
	protected viewConfig: ViewConfig;
	protected dataStore: DataStore;

	constructor(
		app: App,
		container: HTMLElement,
		file: TFile,
		database: DatabaseConfig,
		viewConfig: ViewConfig,
		dataStore: DataStore
	) {
		this.app = app;
		this.container = container;
		this.file = file;
		this.database = database;
		this.viewConfig = viewConfig;
		this.dataStore = dataStore;
	}

	abstract render(): Promise<void>;
	abstract destroy(): void;

	protected async refresh(): Promise<void> {
		this.destroy();
		await this.render();
	}

	protected createHeader(): HTMLElement {
		return this.container.createDiv({ cls: 'view-header' });
	}

	protected createToolbar(): HTMLElement {
		return this.container.createDiv({ cls: 'view-toolbar' });
	}

	protected createContent(): HTMLElement {
		return this.container.createDiv({ cls: 'view-content' });
	}

	protected createFooter(): HTMLElement {
		return this.container.createDiv({ cls: 'view-footer' });
	}
}
