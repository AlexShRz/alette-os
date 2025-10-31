import { TIsObject } from "./IsMatchers";
import { TFlattenIntersections } from "./Prettifiers";

/**
 * TDeepReplaceValue - Helper to compute the replacement value
 */
type TDeepReplaceValue<T, R, K extends keyof T> = K extends keyof R
	? TIsObject<R[K]> extends true
		? TIsObject<T[K]> extends true
			? TFlattenIntersections<{
					[P in keyof T[K] | keyof R[K]]: P extends keyof R[K]
						? R[K][P]
						: P extends keyof T[K]
							? T[K][P]
							: never;
				}>
			: R[K]
		: R[K]
	: T[K];

/**
 * DeepReplace - Recursively replaces properties in T with matching properties from R
 *
 * @template T - The original object type
 * @template R - The replacement object type with properties to override
 */
export type TDeepReplace<T, R> = TFlattenIntersections<
	{
		[K in keyof T]: TDeepReplaceValue<T, R, K>;
	} & Omit<R, keyof T>
>;
