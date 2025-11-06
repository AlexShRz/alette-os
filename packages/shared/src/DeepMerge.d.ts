import { TIsObject } from "./IsMatchers";
import { TFlattenIntersections } from "./Prettifiers.js";

/**
 * Marks a type as opaque for deep merge operations.
 * Values wrapped with this will be treated as primitives and unionized instead of merged.
 * Useful for class instances, Dates, Maps, Sets, etc.
 */
export type TDeepMergeAsOpaqueValue<T> = T & { __deepMergeBrand: "opaque" };

type TIsOpaque<T> = T extends { __deepMergeBrand: "opaque" } ? true : false;

type TExtractOpaque<T> = T extends TDeepMergeAsOpaqueValue<infer U> ? U : never;

/**
 * MergeTypes - Helper to compute the merged type of two properties, A and B.
 */
type TMergeTypes<A, B> = unknown extends A
	? B
	: unknown extends B
		? A
		: A extends readonly any[]
			? B extends readonly any[]
				? [...A, ...B]
				: A | B
			: B extends readonly any[]
				? A | B
				: TIsObject<A> extends true
					? TIsOpaque<A> extends true
						?
								| TExtractOpaque<A>
								| (TIsOpaque<B> extends true ? TExtractOpaque<B> : B)
						: TIsObject<B> extends true
							? TIsOpaque<B> extends true
								? A | TExtractOpaque<B>
								: TDeepMerge<A, B>
							: A | B
					: TIsObject<B> extends true
						? A | B
						: A | B;

export type TDeepMerge<T, R> = TFlattenIntersections<{
	[K in keyof T | keyof R]: K extends keyof T
		? K extends keyof R
			? TMergeTypes<T[K], R[K]>
			: T[K]
		: K extends keyof R
			? R[K]
			: never;
}>;
