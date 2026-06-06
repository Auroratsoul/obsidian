import { App, TFile } from 'obsidian';
import { DatabaseConfig, ViewConfig, RowData, PropertyDef } from '../data/types';
import { DataStore } from '../data/store';
import { BaseView } from './BaseView';

export class GanttView extends BaseView {
	private ganttEl: HTMLElement | null = null;

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
		this.renderGantt(content);
	}

	destroy(): void {
		this.container.empty();
		this.ganttEl = null;
	}

	private renderToolbar(toolbar: HTMLElement): void {
		// Zoom controls
		const zoomInBtn = toolbar.createEl('button', {
			text: '+',
			cls: 'toolbar-btn'
		});
		zoomInBtn.addEventListener('click', () => this.zoomIn());

		const zoomOutBtn = toolbar.createEl('button', {
			text: '-',
			cls: 'toolbar-btn'
		});
		zoomOutBtn.addEventListener('click', () => this.zoomOut());

		// Time range buttons
		const weekBtn = toolbar.createEl('button', {
			text: 'Week',
			cls: 'toolbar-btn'
		});
		weekBtn.addEventListener('click', () => this.setTimeRange('week'));

		const monthBtn = toolbar.createEl('button', {
			text: 'Month',
			cls: 'toolbar-btn'
		});
		monthBtn.addEventListener('click', () => this.setTimeRange('month'));
	}

	private renderGantt(container: HTMLElement): void {
		this.ganttEl = container.createDiv({ cls: 'gantt-container' });

		// Find date properties
		const startDateProperty = this.database.properties.find(p => p.name.toLowerCase().includes('start'));
		const endDateProperty = this.database.properties.find(p => p.name.toLowerCase().includes('end'));

		if (!startDateProperty || !endDateProperty) {
			this.ganttEl.createDiv({
				text: 'Start and end date properties required for gantt view',
				cls: 'gantt-error'
			});
			return;
		}

		// Calculate date range
		const dates = this.getDateRange(startDateProperty, endDateProperty);
		if (dates.length === 0) {
			this.ganttEl.createDiv({
				text: 'No dates found',
				cls: 'gantt-empty'
			});
			return;
		}

		const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
		const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

		// Render timeline header
		this.renderTimelineHeader(minDate, maxDate);

		// Render tasks
		this.renderTasks(startDateProperty, endDateProperty, minDate, maxDate);
	}

	private renderTimelineHeader(minDate: Date, maxDate: Date): void {
		const timelineHeader = this.ganttEl!.createDiv({ cls: 'timeline-header' });

		// Calculate number of days
		const days = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

		// Render day columns
		for (let i = 0; i < days; i++) {
			const date = new Date(minDate);
			date.setDate(date.getDate() + i);

			const dayCol = timelineHeader.createDiv({
				text: String(date.getDate()),
				cls: 'timeline-day'
			});

			// Highlight weekends
			if (date.getDay() === 0 || date.getDay() === 6) {
				dayCol.classList.add('weekend');
			}
		}
	}

	private renderTasks(
		startDateProperty: PropertyDef,
		endDateProperty: PropertyDef,
		minDate: Date,
		maxDate: Date
	): void {
		const tasksContainer = this.ganttEl!.createDiv({ cls: 'tasks-container' });

		for (const row of this.database.rows) {
			const startDate = row.cells[startDateProperty.id];
			const endDate = row.cells[endDateProperty.id];

			if (!startDate || !endDate) continue;

			const taskRow = tasksContainer.createDiv({ cls: 'task-row' });

			// Task label
			const titleProperty = this.database.properties.find(p => p.type === 'text');
			const taskName = titleProperty ? row.cells[titleProperty.id] : 'Untitled';
			taskRow.createDiv({ text: taskName, cls: 'task-label' });

			// Task bar
			const taskBar = taskRow.createDiv({ cls: 'task-bar' });
			const start = new Date(startDate);
			const end = new Date(endDate);

			// Calculate position and width
			const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
			const startOffset = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
			const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

			const leftPercent = (startOffset / totalDays) * 100;
			const widthPercent = (duration / totalDays) * 100;

			taskBar.style.left = `${leftPercent}%`;
			taskBar.style.width = `${widthPercent}%`;

			// Add hover effect
			taskBar.addEventListener('mouseenter', () => {
				taskBar.classList.add('hover');
			});

			taskBar.addEventListener('mouseleave', () => {
				taskBar.classList.remove('hover');
			});

			// Add click handler
			taskBar.addEventListener('click', () => {
				this.openTask(row);
			});
		}
	}

	private getDateRange(startDateProperty: PropertyDef, endDateProperty: PropertyDef): Date[] {
		const dates: Date[] = [];

		for (const row of this.database.rows) {
			const startDate = row.cells[startDateProperty.id];
			const endDate = row.cells[endDateProperty.id];

			if (startDate) dates.push(new Date(startDate));
			if (endDate) dates.push(new Date(endDate));
		}

		return dates;
	}

	private openTask(row: RowData): void {
		// TODO: Implement task detail view
		console.log('Open task:', row.id);
	}

	private zoomIn(): void {
		// TODO: Implement zoom in
		console.log('Zoom in');
	}

	private zoomOut(): void {
		// TODO: Implement zoom out
		console.log('Zoom out');
	}

	private setTimeRange(range: 'week' | 'month'): void {
		// TODO: Implement time range setting
		console.log('Set time range:', range);
	}
}
