import { App, TFile } from 'obsidian';
import { DatabaseConfig, ViewConfig, RowData, PropertyDef } from '../data/types';
import { DataStore } from '../data/store';
import { BaseView } from './BaseView';

export class TableView extends BaseView {
	private tableEl: HTMLElement | null = null;

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
		this.renderTable(content);

		const footer = this.createFooter();
		this.renderFooter(footer);
	}

	destroy(): void {
		this.container.empty();
		this.tableEl = null;
	}

	private renderToolbar(toolbar: HTMLElement): void {
		// Add row button
		const addRowBtn = toolbar.createEl('button', {
			text: '+ Add Row',
			cls: 'toolbar-btn'
		});
		addRowBtn.addEventListener('click', () => this.addRow());

		// Add column button
		const addColBtn = toolbar.createEl('button', {
			text: '+ Add Column',
			cls: 'toolbar-btn'
		});
		addColBtn.addEventListener('click', () => this.addColumn());
	}

	private renderTable(container: HTMLElement): void {
		this.tableEl = container.createEl('table', { cls: 'database-table' });

		// Render header
		const thead = this.tableEl.createEl('thead');
		const headerRow = thead.createEl('tr');

		// Add row number column
		headerRow.createEl('th', { text: '#', cls: 'row-number-header' });

		// Add property columns
		for (const property of this.database.properties) {
			const th = headerRow.createEl('th', { cls: 'property-header' });
			th.createSpan({ text: property.name, cls: 'property-name' });
			th.createSpan({ text: this.getPropertyTypeIcon(property.type), cls: 'property-icon' });
		}

		// Render body
		const tbody = this.tableEl.createEl('tbody');
		for (let i = 0; i < this.database.rows.length; i++) {
			const row = this.database.rows[i];
			if (row) {
				this.renderRow(tbody, row, i + 1);
			}
		}
	}

	private renderRow(tbody: HTMLElement, row: RowData, rowIndex: number): void {
		const tr = tbody.createEl('tr', { cls: 'database-row' });

		// Row number cell
		const rowNumCell = tr.createEl('td', { cls: 'row-number' });
		rowNumCell.textContent = String(rowIndex);

		// Data cells
		for (const property of this.database.properties) {
			const td = tr.createEl('td', { cls: 'data-cell' });
			const value = row.cells[property.id];
			this.renderCell(td, property, value, row.id);
		}
	}

	private renderCell(td: HTMLElement, property: PropertyDef, value: any, rowId: string): void {
		switch (property.type) {
			case 'text':
				this.renderTextCell(td, value, property.id, rowId);
				break;
			case 'number':
				this.renderNumberCell(td, value, property.id, rowId);
				break;
			case 'select':
				this.renderSelectCell(td, value, property, rowId);
				break;
			case 'date':
				this.renderDateCell(td, value, property.id, rowId);
				break;
			case 'checkbox':
				this.renderCheckboxCell(td, value, property.id, rowId);
				break;
			default:
				td.textContent = String(value || '');
		}
	}

	private renderTextCell(td: HTMLElement, value: any, propertyId: string, rowId: string): void {
		const displayValue = value || '';
		td.textContent = displayValue;
		td.addEventListener('dblclick', () => {
			td.empty();
			const input = td.createEl('input', { type: 'text', value: displayValue });
			input.focus();
			input.addEventListener('blur', () => {
				this.updateCell(rowId, propertyId, input.value);
				td.textContent = input.value;
			});
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					input.blur();
				}
			});
		});
	}

	private renderNumberCell(td: HTMLElement, value: any, propertyId: string, rowId: string): void {
		const displayValue = value || '';
		td.textContent = displayValue;
		td.addEventListener('dblclick', () => {
			td.empty();
			const input = td.createEl('input', { type: 'number', value: displayValue });
			input.focus();
			input.addEventListener('blur', () => {
				const numValue = parseFloat(input.value);
				this.updateCell(rowId, propertyId, isNaN(numValue) ? null : numValue);
				td.textContent = input.value;
			});
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					input.blur();
				}
			});
		});
	}

	private renderSelectCell(td: HTMLElement, value: any, property: PropertyDef, rowId: string): void {
		const selectedOption = property.options?.find(opt => opt.id === value);
		if (selectedOption) {
			const tag = td.createSpan({
				text: selectedOption.name,
				cls: 'select-tag'
			});
			tag.style.backgroundColor = this.getTagColor(selectedOption.color);
		}

		td.addEventListener('click', () => {
			td.empty();
			const select = td.createEl('select');
			select.createEl('option', { text: '', value: '' });

			for (const option of property.options || []) {
				const opt = select.createEl('option', {
					text: option.name,
					value: option.id
				});
				if (option.id === value) {
					opt.selected = true;
				}
			}

			select.focus();
			select.addEventListener('change', () => {
				this.updateCell(rowId, property.id, select.value);
				this.renderSelectCell(td, select.value, property, rowId);
			});
			select.addEventListener('blur', () => {
				this.renderSelectCell(td, select.value, property, rowId);
			});
		});
	}

	private renderDateCell(td: HTMLElement, value: any, propertyId: string, rowId: string): void {
		const displayValue = value || '';
		td.textContent = displayValue;
		td.addEventListener('dblclick', () => {
			td.empty();
			const input = td.createEl('input', { type: 'date', value: displayValue });
			input.focus();
			input.addEventListener('change', () => {
				this.updateCell(rowId, propertyId, input.value);
				td.textContent = input.value;
			});
		});
	}

	private renderCheckboxCell(td: HTMLElement, value: any, propertyId: string, rowId: string): void {
		const checkbox = td.createEl('input', { type: 'checkbox' });
		checkbox.checked = value === true;
		checkbox.addEventListener('change', () => {
			this.updateCell(rowId, propertyId, checkbox.checked);
		});
	}

	private renderFooter(footer: HTMLElement): void {
		footer.createSpan({
			text: `${this.database.rows.length} rows`,
			cls: 'row-count'
		});
	}

	private async addRow(): Promise<void> {
		const newRow: RowData = {
			id: `row_${Date.now()}`,
			cells: {}
		};

		// Initialize cells with default values
		for (const property of this.database.properties) {
			newRow.cells[property.id] = this.getDefaultValue(property.type);
		}

		await this.dataStore.addRow(this.file, newRow);
		await this.refresh();
	}

	private async addColumn(): Promise<void> {
		// TODO: Implement add column dialog
		console.log('Add column clicked');
	}

	private async updateCell(rowId: string, propertyId: string, value: any): Promise<void> {
		const row = this.database.rows.find(r => r.id === rowId);
		if (row) {
			row.cells[propertyId] = value;
			await this.dataStore.updateRow(this.file, rowId, row);
		}
	}

	private getDefaultValue(type: string): any {
		switch (type) {
			case 'text':
				return '';
			case 'number':
				return null;
			case 'select':
				return null;
			case 'date':
				return null;
			case 'checkbox':
				return false;
			default:
				return null;
		}
	}

	private getPropertyTypeIcon(type: string): string {
		switch (type) {
			case 'text':
				return 'Aa';
			case 'number':
				return '#';
			case 'select':
				return '▼';
			case 'date':
				return '📅';
			case 'checkbox':
				return '☑';
			default:
				return '?';
		}
	}

	private getTagColor(color: string): string {
		const colorMap: Record<string, string> = {
			'gray': '#e8e8e8',
			'brown': '#e4d8c0',
			'orange': '#fadec9',
			'yellow': '#fdecc8',
			'green': '#dbeddb',
			'blue': '#d3e5ef',
			'purple': '#e8deee',
			'pink': '#f5e0e9',
			'red': '#ffe2dd'
		};
		return colorMap[color] || '#e8e8e8';
	}
}
