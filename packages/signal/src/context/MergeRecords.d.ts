type FlattenIntersections<T> = {
	[K in keyof T]: T[K];
} & {};

export type MergeRecords<T, U> = FlattenIntersections<Omit<T, keyof U> & U>;
