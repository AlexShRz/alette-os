type TFlattenIntersections<T> = {
	[K in keyof T]: T[K];
} & {};

export type TMergeRecords<T, U> = TFlattenIntersections<Omit<T, keyof U> & U>;
