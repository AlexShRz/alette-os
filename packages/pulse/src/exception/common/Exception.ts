import { ApiException } from "./ApiException.js";

type Ctor<T> = new (...args: any[]) => T;

export const Exception = {
	As: <const Tag extends string>(
		tag: Tag,
	): Ctor<ApiException & { readonly _tag: Tag }> =>
		class extends ApiException {
			public readonly _tag = tag;
		},
};
