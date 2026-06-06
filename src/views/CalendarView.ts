import { App, TFile } from 'obsidian';
import { DatabaseConfig, ViewConfig, RowData, PropertyDef } from '../data/types';
import { DataStore } from '../data/store';
import { BaseView } from './BaseView';

export class CalendarView extends BaseView {
	private calendarEl: HTMLElement | null = null;
	private currentDate: Date = new Date();

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
		this.renderCalendar(content);
	}

	destroy(): void {
		this.container.empty();
		this.calendarEl = null;
	}

	private renderToolbar(toolbar: HTMLElement): void {
		// Navigation buttons
		const prevBtn = toolbar.createEl('button', {
			text: '<',
			cls: 'toolbar-btn'
		});
		prevBtn.addEventListener('click', () => this.previousMonth());

		const todayBtn = toolbar.createEl('button', {
			text: 'Today',
			cls: 'toolbar-btn'
		});
		todayBtn.addEventListener('click', () => this.goToToday());

		const nextBtn = toolbar.createEl('button', {
			text: '>',
			cls: 'toolbar-btn'
		});
		nextBtn.addEventListener('click', () => this.nextMonth());
	}

	private renderCalendar(container: HTMLElement): void {
		this.calendarEl = container.createDiv({ cls: 'calendar-container' });

		// Find date property
		const dateProperty = this.database.properties.find(p => p.type === 'date');
		if (!dateProperty) {
			this.calendarEl.createDiv({
				text: 'No date property found for calendar view',
				cls: 'calendar-error'
			});
			return;
		}

		// Render month header
		const monthHeader = this.calendarEl.createDiv({ cls: 'month-header' });
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		monthHeader.createEl('h3', {
			text: `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
		});

		// Render day headers
		const dayHeaders = this.calendarEl.createDiv({ cls: 'day-headers' });
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		for (const day of dayNames) {
			dayHeaders.createDiv({ text: day, cls: 'day-header' });
		}

		// Render calendar grid
		const grid = this.calendarEl.createDiv({ cls: 'calendar-grid' });
		const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
		const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		// Render 6 weeks
		for (let i = 0; i < 42; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);

			const dayCell = grid.createDiv({ cls: 'day-cell' });
			dayCell.createDiv({
				text: String(date.getDate()),
				cls: 'day-number'
			});

			// Check if date is in current month
			if (date.getMonth() !== this.currentDate.getMonth()) {
				dayCell.classList.add('other-month');
			}

			// Check if date is today
			const today = new Date();
			if (date.toDateString() === today.toDateString()) {
				dayCell.classList.add('today');
			}

			// Add events for this date
			const events = this.getEventsForDate(date, dateProperty);
			for (const event of events) {
				const eventEl = dayCell.createDiv({
					text: this.getEventTitle(event),
					cls: 'calendar-event'
				});
				eventEl.addEventListener('click', () => {
					this.openEvent(event);
				});
			}
		}
	}

	private getEventsForDate(date: Date, dateProperty: PropertyDef): RowData[] {
		const dateString = date.toISOString().split('T')[0];
		return this.database.rows.filter(row => {
			const cellValue = row.cells[dateProperty.id];
			return cellValue === dateString;
		});
	}

	private getEventTitle(row: RowData): string {
		const titleProperty = this.database.properties.find(p => p.type === 'text');
		if (titleProperty) {
			return row.cells[titleProperty.id] || 'Untitled';
		}
		return 'Untitled';
	}

	private openEvent(row: RowData): void {
		// TODO: Implement event detail view
		console.log('Open event:', row.id);
	}

	private previousMonth(): void {
		this.currentDate.setMonth(this.currentDate.getMonth() - 1);
		this.refresh();
	}

	private nextMonth(): void {
		this.currentDate.setMonth(this.currentDate.getMonth() + 1);
		this.refresh();
	}

	private goToToday(): void {
		this.currentDate = new Date();
		this.refresh();
	}
}
