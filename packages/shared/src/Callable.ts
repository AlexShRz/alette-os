// @ts-expect-error
export interface Callable<
	T extends (...args: any[]) => any = (...args: unknown[]) => unknown,
> extends T {}

export class Callable<T extends (...args: any[]) => any> extends Function {
	public constructor(func: T) {
		super();
		return Object.setPrototypeOf(func, new.target.prototype) as typeof this;
	}
}
