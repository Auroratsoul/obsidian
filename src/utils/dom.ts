export function createEl<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	options?: {
		cls?: string;
		text?: string;
		attr?: Record<string, string>;
		children?: HTMLElement[];
	}
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);

	if (options?.cls) {
		el.className = options.cls;
	}

	if (options?.text) {
		el.textContent = options.text;
	}

	if (options?.attr) {
		for (const [key, value] of Object.entries(options.attr)) {
			el.setAttribute(key, value);
		}
	}

	if (options?.children) {
		for (const child of options.children) {
			el.appendChild(child);
		}
	}

	return el;
}

export function createDiv(options?: {
	cls?: string;
	text?: string;
	attr?: Record<string, string>;
}): HTMLDivElement {
	return createEl('div', options);
}

export function createSpan(options?: {
	cls?: string;
	text?: string;
	attr?: Record<string, string>;
}): HTMLSpanElement {
	return createEl('span', options);
}

export function createButton(options?: {
	cls?: string;
	text?: string;
	attr?: Record<string, string>;
	onClick?: (event: MouseEvent) => void;
}): HTMLButtonElement {
	const btn = createEl('button', options);

	if (options?.onClick) {
		btn.addEventListener('click', options.onClick);
	}

	return btn;
}

export function createInput(options?: {
	cls?: string;
	type?: string;
	value?: string;
	placeholder?: string;
	attr?: Record<string, string>;
	onChange?: (event: Event) => void;
}): HTMLInputElement {
	const input = createEl('input', {
		cls: options?.cls,
		attr: {
			...options?.attr,
			...(options?.type ? { type: options.type } : {}),
			...(options?.value ? { value: options.value } : {}),
			...(options?.placeholder ? { placeholder: options.placeholder } : {})
		}
	});

	if (options?.onChange) {
		input.addEventListener('change', options.onChange);
	}

	return input;
}

export function createSelect(options?: {
	cls?: string;
	options?: { value: string; text: string }[];
	onChange?: (event: Event) => void;
}): HTMLSelectElement {
	const select = createEl('select', { cls: options?.cls });

	if (options?.options) {
		for (const opt of options.options) {
			const option = createEl('option', {
				text: opt.text,
				attr: { value: opt.value }
			});
			select.appendChild(option);
		}
	}

	if (options?.onChange) {
		select.addEventListener('change', options.onChange);
	}

	return select;
}

export function emptyEl(el: HTMLElement): void {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}

export function addClass(el: HTMLElement, ...classes: string[]): void {
	for (const cls of classes) {
		el.classList.add(cls);
	}
}

export function removeClass(el: HTMLElement, ...classes: string[]): void {
	for (const cls of classes) {
		el.classList.remove(cls);
	}
}

export function toggleClass(el: HTMLElement, cls: string, force?: boolean): void {
	el.classList.toggle(cls, force);
}

export function hasClass(el: HTMLElement, cls: string): boolean {
	return el.classList.contains(cls);
}
