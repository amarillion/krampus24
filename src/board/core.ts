const PROP_PROVIDES = Symbol('provides');

type Provider = { [PROP_PROVIDES]?: Record<string, unknown> };

export function provide(key: string, value: unknown, component: HTMLElement & Provider) {
	if (!component[PROP_PROVIDES]) {
		component[PROP_PROVIDES] = {};
	}
	component[PROP_PROVIDES][key] = value;
}

export function inject(key: string, component: HTMLElement & Provider) {
	if (!component.parentElement) {
		return;
	}
	const provides = component[PROP_PROVIDES] ?? {};
	if (Object.prototype.hasOwnProperty.call(provides, key)) {
		return provides[key];
	}
	return inject(key, component.parentElement);
}
