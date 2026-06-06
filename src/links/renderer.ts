import { App, TFile } from 'obsidian';
import { LinkResolver } from './resolver';

export class LinkRenderer {
	private app: App;
	private linkResolver: LinkResolver;

	constructor(app: App, linkResolver: LinkResolver) {
		this.app = app;
		this.linkResolver = linkResolver;
	}

	renderLink(el: HTMLElement, linkText: string): void {
		const resolved = this.linkResolver.resolveLink(linkText);

		if (!resolved) {
			el.createSpan({ text: linkText, cls: 'link-unresolved' });
			return;
		}

		const link = el.createEl('a', {
			cls: resolved.type === 'database' ? 'link-database' : 'link-file'
		});

		if (resolved.alias) {
			link.textContent = resolved.alias;
		} else {
			link.textContent = resolved.name;
		}

		link.addEventListener('click', (event) => {
			event.preventDefault();
			this.openLink(resolved.file);
		});
	}

	renderEmbed(el: HTMLElement, linkText: string): void {
		const resolved = this.linkResolver.resolveLink(linkText);

		if (!resolved) {
			el.createDiv({ text: `Embed not found: ${linkText}`, cls: 'embed-unresolved' });
			return;
		}

		if (resolved.type === 'database') {
			this.renderDatabaseEmbed(el, resolved.file);
		} else {
			this.renderFileEmbed(el, resolved.file);
		}
	}

	private async renderDatabaseEmbed(el: HTMLElement, file: TFile): Promise<void> {
		// TODO: Implement database embed rendering
		const container = el.createDiv({ cls: 'database-embed' });
		container.createEl('h3', { text: `Database: ${file.basename}` });
		container.createEl('p', { text: 'Database embed will be rendered here.' });
	}

	private async renderFileEmbed(el: HTMLElement, file: TFile): Promise<void> {
		try {
			const content = await this.app.vault.read(file);
			const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
			el.createDiv({ text: preview, cls: 'file-embed-preview' });
		} catch (error) {
			el.createDiv({ text: `Error loading file: ${error}`, cls: 'embed-error' });
		}
	}

	private openLink(file: TFile): void {
		this.app.workspace.openLinkText(file.path, '', true);
	}
}
