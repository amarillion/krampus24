class AssertionError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export function assert(test: unknown, msg = "") : asserts test {
	if (!test) {
		throw new AssertionError(msg);
	}
}