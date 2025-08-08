export interface IQueryParams
	extends Record<
		string,
		string | number | boolean | null | undefined | IQueryParams
	> {}
