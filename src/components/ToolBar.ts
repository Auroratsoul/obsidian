import { DatabaseConfig, ViewType } from '../data/types';

export class ToolBar {
	private container: HTMLElement;
	private database: DatabaseConfig;
	private onViewChange: (viewType: ViewType) => void;
	private onAddRow: () => void;
	private onAddColumn: () => void;

	constructor(
		container: HTMLElement,
		database: DatabaseConfig,
		onViewChange: (viewType: ViewType) => void,
		onAddRow: () => void,
		onAddColumn: () => void
	) {
		this.container = container;
		this.database = database;
		this.onViewChange = onViewChange;
		this.onAddRow = onAddRow;
		this.onAddColumn = onAddColumn;

		this.render();
	}

	private render(): void {
		this.container.empty();
		this.container.addClass('toolbar');

		// Left section - Add buttons
		const leftSection = this.container.createDiv({ cls: 'toolbar-left' });

		const addRowBtn = leftSection.createEl('button', {
			text: '+ Add Row',
			cls: 'toolbar-btn primary'
		});
		addRowBtn.addEventListener('click', () => this.onAddRow());

		const addColBtn = leftSection.createEl('button', {
			text: '+ Add Column',
			cls: 'toolbar-btn'
		});
		addColBtn.addEventListener('click', () => this.onAddColumn());

		// Center section - View selector
		const centerSection = this.container.createDiv({ cls: 'toolbar-center' });

		const viewTypes: ViewType[] = ['table', 'board', 'calendar', 'gantt'];
		for (const viewType of viewTypes) {
			const viewBtn = centerSection.createEl('button', {
				text: this.getViewTypeName(viewType),
				cls: 'toolbar-btn view-btn'
			});

			if (viewType === 'table') {
				viewBtn.addClass('active');
			}

			viewBtn.addEventListener('click', () => {
				// Update active state
				this.container.querySelectorAll('.view-btn').forEach(btn => {
					btn.removeClass('active');
				});
				viewBtn.addClass('active');

				this.onViewChange(viewType);
			});
		}

		// Right section - Actions
		const rightSection = this.container.createDiv({ cls: 'toolbar-right' });

		const filterBtn = rightSection.createEl('button', {
			text: 'Filter',
			cls: 'toolbar-btn'
		});

		const sortBtn = rightSection.createEl('button', {
			text: 'Sort',
			cls: 'toolbar-btn'
		});

		const groupBtn = rightSection.createEl('button', {
			text: 'Group',
			cls: 'toolbar-btn'
		});
	}

	private getViewTypeName(viewType: ViewType): string {
		switch (viewType) {
			case 'table':
				return 'Table';
			case 'board':
				return 'Board';
			case 'calendar':
				return 'Calendar';
			case 'gantt':
				return 'Gantt';
			default:
				return viewType;
		}
	}
}
