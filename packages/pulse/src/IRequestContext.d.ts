export interface IRequestContext<
	V extends Record<string, any> = {},
	M extends Record<string, any> = {},
> {
	value: V;
	meta: M;
}
