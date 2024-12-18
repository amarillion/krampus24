const PROP_PROVIDES = Symbol('provides');

export function provide(key, value, component) {
	if (!component[PROP_PROVIDES]) {
		component[PROP_PROVIDES] = {};
	}
	component[PROP_PROVIDES][key] = value;
}

export function inject(key, component) {
	if (!component.parentElement) {
		return;
	}
	const provides = component[PROP_PROVIDES] ?? {};
	if (Object.prototype.hasOwnProperty.call(provides, key)) {
		return provides[key];
	}
	return inject(key, component.parentElement);
}
