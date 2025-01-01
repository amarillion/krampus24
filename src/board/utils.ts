/** Used as https://ramdajs.com/docs/#always */
export function always<T>(value: T) {
	return () => value;
}

/** Used as https://ramdajs.com/docs/#pipe */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function pipe(firstFn: Function, ...fns: Function[]) {
	return (...args: unknown[]) => fns.reduce((acc, fn) => fn(acc), firstFn(...args));
}
