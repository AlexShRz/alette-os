export type TFlattenIntersections<T> = {
	[K in keyof T]: T[K];
} & {};
