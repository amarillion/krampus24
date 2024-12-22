/** Used as https://ramdajs.com/docs/#always */
export function always<T>(value: T) {
	return () => value;
}

/** Used as https://ramdajs.com/docs/#findIndex */
export function findIndex<T>(predicate: (t: T) => boolean, array: T[]) {
	if (!array.length) { return -1; }
	for (let index = 0; index < array.length; index++) {
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

/** Used as https://ramdajs.com/docs/#indexOf */
export function indexOf<T>(value: T, array: T[]) {
	return findIndex(element => element === value, array);
}

/** Used as https://ramdajs.com/docs/#pipe */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function pipe(firstFn: Function, ...fns: Function[]) {
	return (...args: unknown[]) => fns.reduce((acc, fn) => fn(acc), firstFn(...args));
}
