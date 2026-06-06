// Database plugin types

export interface DatabaseConfig {
	id: string;
	name: string;
	type: 'database';
	version: number;
	created: string;
	updated: string;
	aliases: string[];
	properties: PropertyDef[];
	views: ViewConfig[];
	rows: RowData[];
}

export interface PropertyDef {
	id: string;
	name: string;
	type: PropertyType;
	options?: SelectOption[];
	formula?: string;
	relation?: RelationConfig;
	rollup?: RollupConfig;
	validation?: ValidationConfig;
	display?: DisplayConfig;
}

export type PropertyType =
	| 'text'
	| 'number'
	| 'select'
	| 'date'
	| 'checkbox'
	| 'multi-select'
	| 'url'
	| 'email'
	| 'phone'
	| 'file'
	| 'relation'
	| 'rollup'
	| 'formula';

export interface SelectOption {
	id: string;
	name: string;
	color: string;
}

export interface RelationConfig {
	databaseId: string;
	propertyId: string;
}

export interface RollupConfig {
	relationPropertyId: string;
	propertyId: string;
	function: 'count' | 'sum' | 'average' | 'min' | 'max';
}

export interface ValidationConfig {
	required?: boolean;
	min?: number;
	max?: number;
	pattern?: string;
}

export interface DisplayConfig {
	width?: number;
	hidden?: boolean;
	sort?: 'asc' | 'desc';
}

export interface ViewConfig {
	id: string;
	name: string;
	type: ViewType;
	config: ViewSettings;
}

export type ViewType = 'table' | 'board' | 'calendar' | 'gantt';

export interface ViewSettings {
	filters?: FilterConfig[];
	sorts?: SortConfig[];
	groups?: GroupConfig[];
	visibleProperties?: string[];
}

export interface FilterConfig {
	propertyId: string;
	operator: FilterOperator;
	value: any;
}

export type FilterOperator =
	| 'equals'
	| 'not_equals'
	| 'contains'
	| 'not_contains'
	| 'starts_with'
	| 'ends_with'
	| 'is_empty'
	| 'is_not_empty'
	| 'greater_than'
	| 'less_than'
	| 'greater_than_or_equal'
	| 'less_than_or_equal';

export interface SortConfig {
	propertyId: string;
	direction: 'asc' | 'desc';
}

export interface GroupConfig {
	propertyId: string;
}

export interface RowData {
	id: string;
	cells: Record<string, any>;
}
