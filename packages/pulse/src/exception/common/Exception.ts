import { ApiException } from "./ApiException.js";
import { FatalApiException } from "./FatalApiException";

type Ctor<T> = new (...args: any[]) => T;

export const Exception = {
	As: <T extends string>(name: T): Ctor<ApiException> =>
		// @ts-expect-error
		class extends ApiException {
			protected override customName = name;
		},
	AsFatal: <T extends string>(name: T): Ctor<FatalApiException> =>
		class extends FatalApiException {
			protected override customName = name;
		},
};
