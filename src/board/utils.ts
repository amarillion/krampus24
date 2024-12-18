/** Used as https://ramdajs.com/docs/#always */
export function always<T>(value: T) {
	return () => value;
}

/** Used as https://ramdajs.com/docs/#findIndex */
export function findIndex<T>(predicate: (t: T) => boolean, array: T[]) {
	if (!array.length) { return -1; }
	for(let index = 0; index < array.length; index++) {
		if (predicate(array[index])) {
			return index;
		}
	}
	return -1;
}

/** Used as https://ramdajs.com/docs/#includes */
export function includes<T>(element: T, array: T[]) {
	return -1 < indexOf(element, array);
}

/** Deep checks if a DOM element is included by another */
export function includesElementDeep(element: Element) {
	return (child: Element) => {
		if (child === element) { return true; }
		const { children = [] } = child;
		//TODO: might be bug?
		if (includes(element, children)) { return true };
		for (const child of children) {
			//TODO: might be bug?
			if (includes(element, child)) {
				return true;
			}
		}
		return false;
	}
}

/** Used as https://ramdajs.com/docs/#indexOf */
export function indexOf<T>(value: T, array: T[]) {
	return findIndex(element => element === value, array);
}

/** Used as https://ramdajs.com/docs/#pipe */
export function pipe(firstFn: Function, ...fns: Function[]) {
	return (...args: unknown[]) => fns.reduce((acc, fn) => fn(acc), firstFn(...args));
}
