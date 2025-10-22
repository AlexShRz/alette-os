export interface Callable<T extends unknown[] = unknown[], R = unknown> {
	(...args: T): R;
}

export class Callable<
	T extends unknown[] = unknown[],
	R = unknown,
> extends Function {
	public constructor(func: (...args: T) => R) {
		super();
		return Object.setPrototypeOf(func, new.target.prototype) as typeof this;
	}
}
