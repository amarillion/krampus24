/** Used as https://ramdajs.com/docs/#always */
export function always(value) {
	return () => value;
}

/** Used as https://ramdajs.com/docs/#findIndex */
export function findIndex(predicate, array) {
	if (!array.length) { return -1; }
	for(let index = 0; index < array.length; index++) {
		if (predicate(array[index])) {
			return index;
		}
	}
	return -1;
}

/** Used as https://ramdajs.com/docs/#includes */
export function includes(element, array) {
	return -1 < indexOf(element, array);
}

/** Deep checks if a DOM element is included by another */
export function includesElementDeep(element) {
	return child => {
		if (child === element) { return true; }
		const { children = [] } = child;
		if (includes(element, children)) { return true };
		for (const child of children) {
			if (includes(element, child)) {
				return true;
			}
		}
		return false;
	}
}

/** Used as https://ramdajs.com/docs/#indexOf */
export function indexOf(value, array) {
	return findIndex(element => element === value, array);
}

/** Used as https://ramdajs.com/docs/#pipe */
export function pipe(firstFn, ...fns) {
	return (...args) => fns.reduce((acc, fn) => fn(acc), firstFn(...args));
}
