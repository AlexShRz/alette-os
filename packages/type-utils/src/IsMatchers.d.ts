/**
 * TIsAny - Check if type is any
 */
export type TIsAny<T> = 0 extends 1 & T ? true : false;

/**
 * TIsObject - Check if type is a "plain" object intended for merging.
 *
 * This check identifies "plain" objects (like { a: 1 } or Record<string, any>)
 * while correctly excluding:
 * - Arrays
 * - Functions
 * - 'any'
 * - Class instances (e.g., Date, RegExp, AbortController, new MyClass())
 */
export type TIsObject<T> = T extends object
	? T extends any[]
		? false
		: T extends (...args: any[]) => any
			? false
			: TIsAny<T> extends true
				? false
				: true
	: false;

/**
 * DO NOT try to remove "? true : false;" condition.
 * If you add more generics to the type, their type
 * might be incorrectly inferred in some use cases.
 * DO NOT do this - "TIsExactlyLeft<Expected, Actual, IfTrue, IfFalse>"
 * */
// https://www.reddit.com/r/typescript/comments/i8vxz2/comment/g1b51g0/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
export type TIsExactlyLeft<
	TExpected,
	TActual extends TExpected,
> = TExpected extends TActual ? true : false;
