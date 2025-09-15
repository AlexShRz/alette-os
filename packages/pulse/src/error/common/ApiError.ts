import { ApiErrorInstance } from "./ApiErrorInstance";
import { FatalApiError } from "./FatalApiError";

type Ctor<T> = new (...args: any[]) => T;

export const ApiError = {
	As: <T extends string>(name: T): Ctor<ApiErrorInstance> =>
		// @ts-expect-error
		class extends ApiErrorInstance {
			protected override customName = name;
		},
	AsFatal: <T extends string>(name: T): Ctor<FatalApiError> =>
		class extends FatalApiError {
			protected override customName = name;
		},
};
