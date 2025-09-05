import { IRequestContext } from "../IRequestContext";
import { TMergeRecords } from "./TMergeRecords";

export type TRequestArguments<C extends IRequestContext> =
	C["accepts"] extends [] ? [] : C["accepts"][];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> = C["types"]["errorType"];

export type TGetAllRequestContext<C extends IRequestContext = IRequestContext> =
	TMergeRecords<C["value"], C["settings"]>;

// Merge two records
type Merge<A, B> = {
	[K in keyof A | keyof B]: K extends keyof B
		? B[K]
		: K extends keyof A
			? A[K]
			: never;
};

// Recursively merge all records in a tuple
type MergeAll<T extends readonly unknown[]> = T extends [
	infer Head,
	...infer Tail,
]
	? Head extends Record<string, unknown>
		? Tail extends readonly unknown[]
			? Merge<Head, MergeAll<Tail>>
			: Head
		: MergeAll<Tail>
	: {}; // base case

export type TInferrableRequestArguments<C extends IRequestContext> = MergeAll<
	TRequestArguments<C>
>;
