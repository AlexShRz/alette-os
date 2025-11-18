import { TIsObject } from "./IsMatchers";
import { TFlattenIntersections } from "./Prettifiers";

/**
 * Check if a property is optional in an object type
 */
type TIsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

/**
 * TDeepReplaceValue - Helper to compute the replacement value
 */
type TDeepReplaceValue<T, R, K extends keyof T> = K extends keyof R
	? TIsObject<R[K]> extends true
		? TIsObject<T[K]> extends true
			? TDeepReplace<T[K], R[K]> // Recursively use TDeepReplace instead of manual intersection
			: R[K]
		: R[K]
	: T[K];

/**
 * DeepReplace - Recursively replaces properties in T with matching properties from R
 * Preserves optional/required modifiers from both T and R
 *
 * @template T - The original object type
 * @template R - The replacement object type with properties to override
 */
export type TDeepReplace<T, R> = TFlattenIntersections<
	{
		// Optional properties from T (keeping T's optionality) or replaced by optional R properties
		[K in keyof T as K extends keyof R
			? TIsOptional<R, K> extends true
				? K
				: never
			: TIsOptional<T, K> extends true
				? K
				: never]?: TDeepReplaceValue<T, R, K>;
	} & {
		// Required properties from T or replaced by required R properties
		[K in keyof T as K extends keyof R
			? TIsOptional<R, K> extends true
				? never
				: K
			: TIsOptional<T, K> extends true
				? never
				: K]: TDeepReplaceValue<T, R, K>;
	} & Omit<R, keyof T>
>;
