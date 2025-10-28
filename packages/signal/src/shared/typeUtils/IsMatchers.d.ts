/**
 * IsAny - Check if type is any
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * IsObject - Check if type is a plain object (not array, function, or primitive)
 */
export type IsObject<T> = T extends object
	? T extends any[]
		? false
		: T extends (...args: any[]) => any
			? false
			: IsAny<T> extends true
				? false
				: true
	: false;

/**
 * Detect if a type is a tuple or array
 */
export type IsTuple<T> = T extends readonly any[]
	? number extends T["length"]
		? false
		: true
	: false;
