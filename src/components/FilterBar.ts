import { DatabaseConfig, FilterConfig, FilterOperator, PropertyDef } from '../data/types';

export class FilterBar {
	private container: HTMLElement;
	private database: DatabaseConfig;
	private filters: FilterConfig[];
	private onFiltersChange: (filters: FilterConfig[]) => void;

	constructor(
		container: HTMLElement,
		database: DatabaseConfig,
		filters: FilterConfig[],
		onFiltersChange: (filters: FilterConfig[]) => void
	) {
		this.container = container;
		this.database = database;
		this.filters = filters;
		this.onFiltersChange = onFiltersChange;

		this.render();
	}

	private render(): void {
		this.container.empty();
		this.container.addClass('filter-bar');

		// Header
		const header = this.container.createDiv({ cls: 'filter-header' });
		header.createSpan({ text: 'Filters', cls: 'filter-title' });

		const addFilterBtn = header.createEl('button', {
			text: '+ Add Filter',
			cls: 'filter-add-btn'
		});
		addFilterBtn.addEventListener('click', () => this.addFilter());

		// Filter list
		const filterList = this.container.createDiv({ cls: 'filter-list' });
		for (let i = 0; i < this.filters.length; i++) {
			const filter = this.filters[i];
			if (filter) {
				this.renderFilter(filterList, filter, i);
			}
		}
	}

	private renderFilter(container: HTMLElement, filter: FilterConfig, index: number): void {
		const filterEl = container.createDiv({ cls: 'filter-item' });

		// Property selector
		const propertySelect = filterEl.createEl('select', { cls: 'filter-property' });
		for (const property of this.database.properties) {
			const option = propertySelect.createEl('option', {
				text: property.name,
				value: property.id
			});
			if (property.id === filter.propertyId) {
				option.selected = true;
			}
		}

		propertySelect.addEventListener('change', () => {
			const filter = this.filters[index];
			if (filter) {
				filter.propertyId = propertySelect.value;
				this.onFiltersChange(this.filters);
			}
		});

		// Operator selector
		const operatorSelect = filterEl.createEl('select', { cls: 'filter-operator' });
		const property = this.database.properties.find(p => p.id === filter.propertyId);
		const operators: FilterOperator[] = property ? this.getOperatorsForProperty(property) : ['equals'];

		for (const op of operators) {
			const option = operatorSelect.createEl('option', {
				text: this.getOperatorName(op),
				value: op
			});
			if (op === filter.operator) {
				option.selected = true;
			}
		}

		operatorSelect.addEventListener('change', () => {
			const filter = this.filters[index];
			if (filter) {
				filter.operator = operatorSelect.value as FilterOperator;
				this.onFiltersChange(this.filters);
			}
		});

		// Value input
		const valueInput = filterEl.createEl('input', {
			cls: 'filter-value',
			value: filter.value || ''
		});

		valueInput.addEventListener('change', () => {
			const filter = this.filters[index];
			if (filter) {
				filter.value = valueInput.value;
				this.onFiltersChange(this.filters);
			}
		});

		// Remove button
		const removeBtn = filterEl.createEl('button', {
			text: '×',
			cls: 'filter-remove-btn'
		});
		removeBtn.addEventListener('click', () => {
			this.filters.splice(index, 1);
			this.onFiltersChange(this.filters);
			this.render();
		});
	}

	private addFilter(): void {
		const firstProperty = this.database.properties[0];
		if (!firstProperty) return;

		const newFilter: FilterConfig = {
			propertyId: firstProperty.id,
			operator: 'equals',
			value: ''
		};

		this.filters.push(newFilter);
		this.onFiltersChange(this.filters);
		this.render();
	}

	private getOperatorsForProperty(property: PropertyDef): FilterOperator[] {
		switch (property.type) {
			case 'text':
				return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'];
			case 'number':
				return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'is_empty', 'is_not_empty'];
			case 'select':
				return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
			case 'date':
				return ['equals', 'not_equals', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];
			case 'checkbox':
				return ['equals'];
			default:
				return ['equals', 'not_equals'];
		}
	}

	private getOperatorName(operator: FilterOperator): string {
		const names: Record<FilterOperator, string> = {
			'equals': 'Equals',
			'not_equals': 'Not Equals',
			'contains': 'Contains',
			'not_contains': 'Not Contains',
			'starts_with': 'Starts With',
			'ends_with': 'Ends With',
			'is_empty': 'Is Empty',
			'is_not_empty': 'Is Not Empty',
			'greater_than': 'Greater Than',
			'less_than': 'Less Than',
			'greater_than_or_equal': 'Greater Than or Equal',
			'less_than_or_equal': 'Less Than or Equal'
		};
		return names[operator] || operator;
	}
}
