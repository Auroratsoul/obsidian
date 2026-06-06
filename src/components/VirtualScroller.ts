export class VirtualScroller {
	private container: HTMLElement;
	private contentEl!: HTMLElement;
	private items: any[];
	private itemHeight: number;
	private visibleCount: number;
	private scrollTop: number = 0;
	private renderItem: (item: any) => HTMLElement;

	constructor(
		container: HTMLElement,
		items: any[],
		itemHeight: number,
		renderItem: (item: any) => HTMLElement
	) {
		this.container = container;
		this.items = items;
		this.itemHeight = itemHeight;
		this.renderItem = renderItem;

		this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;

		this.init();
	}

	private init(): void {
		this.container.addClass('virtual-scroller');

		// Create content container
		this.contentEl = this.container.createDiv({ cls: 'virtual-scroller-content' });
		this.contentEl.style.height = `${this.items.length * this.itemHeight}px`;
		this.contentEl.style.position = 'relative';

		// Add scroll listener
		this.container.addEventListener('scroll', () => {
			this.scrollTop = this.container.scrollTop;
			this.renderVisibleItems();
		});

		// Initial render
		this.renderVisibleItems();
	}

	private renderVisibleItems(): void {
		this.contentEl.empty();

		const startIndex = Math.floor(this.scrollTop / this.itemHeight);
		const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);

		for (let i = startIndex; i < endIndex; i++) {
			const itemEl = this.renderItem(this.items[i]);
			itemEl.style.position = 'absolute';
			itemEl.style.top = `${i * this.itemHeight}px`;
			itemEl.style.width = '100%';
			this.contentEl.appendChild(itemEl);
		}
	}

	updateItems(items: any[]): void {
		this.items = items;
		this.contentEl.style.height = `${this.items.length * this.itemHeight}px`;
		this.renderVisibleItems();
	}

	scrollToItem(index: number): void {
		if (index >= 0 && index < this.items.length) {
			this.container.scrollTop = index * this.itemHeight;
		}
	}

	destroy(): void {
		this.container.empty();
	}
}
