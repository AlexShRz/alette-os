import { TIsObject } from "./IsMatchers";
import { TFlattenIntersections } from "./Prettifiers.js";

/**
 * MergeTypes - Helper to compute the merged type of two properties, A and B.
 * - Concatenates arrays.
 * - Recursively merges objects.
 * - Unions all other types.
 */
type TMergeTypes<A, B> =
	// Case 1: A is an array
	A extends readonly any[]
		? // Case 1a: B is also an array -> Concatenate
			B extends readonly any[]
			? [...A, ...B]
			: // Case 1b: B is not an array -> Union
				A | B
		: // Case 2: B is an array (and A is not) -> Union
			B extends readonly any[]
			? A | B
			: // Case 3: A is an object
				TIsObject<A> extends true
				? // Case 3a: B is also an object -> Recurse
					TIsObject<B> extends true
					? TDeepMerge<A, B>
					: // Case 3b: B is not an object -> Union
						A | B
				: // Case 4: B is an object (and A is not) -> Union
					TIsObject<B> extends true
					? A | B
					: // Case 5: Both are primitives (or other non-array, non-object) -> Union
						A | B;

/**
 * TDeepMerge - Recursively merges properties of R into T.
 *
 * @template T - The original object type
 * @template R - The object type to merge in
 */
export type TDeepMerge<T, R> = TFlattenIntersections<{
	// Iterate over all keys from both T and R
	[K in keyof T | keyof R]: // K is in both T and R
	K extends keyof T
		? K extends keyof R
			? TMergeTypes<T[K], R[K]> // -> Merge the types
			: // K is only in T
				T[K]
		: // K is only in R
			K extends keyof R
			? R[K]
			: never;
}>;
