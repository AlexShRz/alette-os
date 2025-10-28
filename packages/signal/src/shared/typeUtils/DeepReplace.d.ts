import { IsObject } from "./IsMatchers";
import { TFlattenIntersections } from "./Prettifiers";

/**
 * DeepReplaceValue - Helper to compute the replacement value
 */
type DeepReplaceValue<T, R, K extends keyof T> = K extends keyof R
	? IsObject<R[K]> extends true
		? IsObject<T[K]> extends true
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
export type DeepReplace<T, R> = TFlattenIntersections<
	{
		[K in keyof T]: DeepReplaceValue<T, R, K>;
	} & Omit<R, keyof T>
>;
