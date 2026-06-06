import { App, PluginSettingTab, Setting } from 'obsidian';
import PrismTablePlugin from './main';

export interface PrismTableSettings {
	defaultView: 'table' | 'board' | 'calendar' | 'gantt';
	dateFormat: string;
	theme: 'light' | 'dark' | 'auto';
	showRowNumbers: boolean;
	enableVirtualScrolling: boolean;
	autoSave: boolean;
	autoSaveInterval: number;
}

export const DEFAULT_SETTINGS: PrismTableSettings = {
	defaultView: 'table',
	dateFormat: 'YYYY-MM-DD',
	theme: 'auto',
	showRowNumbers: true,
	enableVirtualScrolling: true,
	autoSave: true,
	autoSaveInterval: 5000
};

export class PrismTableSettingTab extends PluginSettingTab {
	plugin: PrismTablePlugin;

	constructor(app: App, plugin: PrismTablePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Prism Table Settings' });

		// Default View Setting
		new Setting(containerEl)
			.setName('Default View')
			.setDesc('Choose the default view for new tables')
			.addDropdown(dropdown => {
				dropdown
					.addOption('table', 'Table')
					.addOption('board', 'Board')
					.addOption('calendar', 'Calendar')
					.addOption('gantt', 'Gantt')
					.setValue(this.plugin.settings.defaultView)
					.onChange(async (value: string) => {
						this.plugin.settings.defaultView = value as 'table' | 'board' | 'calendar' | 'gantt';
						await this.plugin.saveSettings();
					});
			});

		// Date Format Setting
		new Setting(containerEl)
			.setName('Date Format')
			.setDesc('Choose the date format for date properties')
			.addDropdown(dropdown => {
				dropdown
					.addOption('YYYY-MM-DD', 'YYYY-MM-DD')
					.addOption('MM/DD/YYYY', 'MM/DD/YYYY')
					.addOption('DD/MM/YYYY', 'DD/MM/YYYY')
					.addOption('YYYY/MM/DD', 'YYYY/MM/DD')
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value: string) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					});
			});

		// Theme Setting
		new Setting(containerEl)
			.setName('Theme')
			.setDesc('Choose the theme for table views')
			.addDropdown(dropdown => {
				dropdown
					.addOption('light', 'Light')
					.addOption('dark', 'Dark')
					.addOption('auto', 'Auto (Follow Obsidian)')
					.setValue(this.plugin.settings.theme)
					.onChange(async (value: string) => {
						this.plugin.settings.theme = value as 'light' | 'dark' | 'auto';
						await this.plugin.saveSettings();
					});
			});

		// Show Row Numbers Setting
		new Setting(containerEl)
			.setName('Show Row Numbers')
			.setDesc('Display row numbers in table view')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showRowNumbers)
					.onChange(async (value: boolean) => {
						this.plugin.settings.showRowNumbers = value;
						await this.plugin.saveSettings();
					});
			});

		// Virtual Scrolling Setting
		new Setting(containerEl)
			.setName('Enable Virtual Scrolling')
			.setDesc('Use virtual scrolling for better performance with large datasets')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.enableVirtualScrolling)
					.onChange(async (value: boolean) => {
						this.plugin.settings.enableVirtualScrolling = value;
						await this.plugin.saveSettings();
					});
			});

		// Auto Save Setting
		new Setting(containerEl)
			.setName('Auto Save')
			.setDesc('Automatically save changes')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.autoSave)
					.onChange(async (value: boolean) => {
						this.plugin.settings.autoSave = value;
						await this.plugin.saveSettings();
					});
			});

		// Auto Save Interval Setting
		new Setting(containerEl)
			.setName('Auto Save Interval')
			.setDesc('Interval in milliseconds for auto save')
			.addSlider(slider => {
				slider
					.setLimits(1000, 30000, 1000)
					.setValue(this.plugin.settings.autoSaveInterval)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.autoSaveInterval = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
