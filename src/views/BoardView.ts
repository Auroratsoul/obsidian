import { App, TFile } from 'obsidian';
import { DatabaseConfig, ViewConfig, RowData, PropertyDef } from '../data/types';
import { DataStore } from '../data/store';
import { BaseView } from './BaseView';

export class BoardView extends BaseView {
	private boardEl: HTMLElement | null = null;

	constructor(
		app: App,
		container: HTMLElement,
		file: TFile,
		database: DatabaseConfig,
		viewConfig: ViewConfig,
		dataStore: DataStore
	) {
		super(app, container, file, database, viewConfig, dataStore);
	}

	async render(): Promise<void> {
		const header = this.createHeader();
		header.createEl('h2', { text: this.database.name });

		const toolbar = this.createToolbar();
		this.renderToolbar(toolbar);

		const content = this.createContent();
		this.renderBoard(content);
	}

	destroy(): void {
		this.container.empty();
		this.boardEl = null;
	}

	private renderToolbar(toolbar: HTMLElement): void {
		// Add card button
		const addCardBtn = toolbar.createEl('button', {
			text: '+ Add Card',
			cls: 'toolbar-btn'
		});
		addCardBtn.addEventListener('click', () => this.addCard());
	}

	private renderBoard(container: HTMLElement): void {
		this.boardEl = container.createDiv({ cls: 'board-container' });

		// Find the select property to use for columns
		const selectProperty = this.database.properties.find(p => p.type === 'select');
		if (!selectProperty) {
			this.boardEl.createDiv({
				text: 'No select property found for board view',
				cls: 'board-error'
			});
			return;
		}

		// Create columns for each option
		for (const option of selectProperty.options || []) {
			const column = this.createColumn(option.name, option.color);
			const cards = this.database.rows.filter(row =>
				row.cells[selectProperty.id] === option.id
			);

			for (const card of cards) {
				this.createCard(column, card, selectProperty);
			}
		}
	}

	private createColumn(title: string, color: string): HTMLElement {
		const column = this.boardEl!.createDiv({ cls: 'board-column' });

		const columnHeader = column.createDiv({ cls: 'column-header' });
		columnHeader.createSpan({ text: title, cls: 'column-title' });
		columnHeader.createSpan({
			text: '0',
			cls: 'column-count'
		});

		const cardsContainer = column.createDiv({ cls: 'cards-container' });

		// Add drop zone functionality
		cardsContainer.addEventListener('dragover', (e) => {
			e.preventDefault();
			cardsContainer.classList.add('drag-over');
		});

		cardsContainer.addEventListener('dragleave', () => {
			cardsContainer.classList.remove('drag-over');
		});

		cardsContainer.addEventListener('drop', (e) => {
			e.preventDefault();
			cardsContainer.classList.remove('drag-over');
			// TODO: Handle drop
		});

		return cardsContainer;
	}

	private createCard(container: HTMLElement, row: RowData, selectProperty: PropertyDef): void {
		const card = container.createDiv({
			cls: 'board-card',
			attr: { 'data-row-id': row.id }
		});

		// Make card draggable
		card.draggable = true;
		card.addEventListener('dragstart', (e) => {
			e.dataTransfer?.setData('text/plain', row.id);
			card.classList.add('dragging');
		});

		card.addEventListener('dragend', () => {
			card.classList.remove('dragging');
		});

		// Render card content
		const titleProperty = this.database.properties.find(p => p.type === 'text');
		if (titleProperty) {
			const title = row.cells[titleProperty.id] || 'Untitled';
			card.createDiv({ text: title, cls: 'card-title' });
		}

		// Render other properties as tags
		const tagsContainer = card.createDiv({ cls: 'card-tags' });
		for (const property of this.database.properties) {
			if (property.id === selectProperty.id) continue;

			const value = row.cells[property.id];
			if (value) {
				const tag = tagsContainer.createSpan({
					text: this.formatPropertyValue(property, value),
					cls: 'card-tag'
				});
			}
		}

		// Add click handler
		card.addEventListener('click', () => {
			this.openCard(row);
		});
	}

	private async addCard(): Promise<void> {
		// TODO: Implement add card dialog
		console.log('Add card clicked');
	}

	private openCard(row: RowData): void {
		// TODO: Implement card detail view
		console.log('Open card:', row.id);
	}

	private formatPropertyValue(property: PropertyDef, value: any): string {
		switch (property.type) {
			case 'text':
				return String(value);
			case 'number':
				return String(value);
			case 'select':
				const option = property.options?.find(o => o.id === value);
				return option?.name || String(value);
			case 'date':
				return value;
			case 'checkbox':
				return value ? '✓' : '✗';
			default:
				return String(value);
		}
	}
}
