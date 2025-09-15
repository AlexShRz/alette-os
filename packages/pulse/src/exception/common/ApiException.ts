import { ApiExceptionInstance } from "./ApiExceptionInstance";
import { FatalApiException } from "./FatalApiException";

type Ctor<T> = new (...args: any[]) => T;

export const ApiException = {
	As: <T extends string>(name: T): Ctor<ApiExceptionInstance> =>
		// @ts-expect-error
		class extends ApiExceptionInstance {
			protected override customName = name;
		},
	AsFatal: <T extends string>(name: T): Ctor<FatalApiException> =>
		class extends FatalApiException {
			protected override customName = name;
		},
};
