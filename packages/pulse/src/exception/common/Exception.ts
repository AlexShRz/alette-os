import { ApiException } from "./ApiException.js";

type Ctor<T> = new (...args: any[]) => T;

export const Exception = {
	Recoverable: (): Ctor<ApiException> => class extends ApiException {},
	Fatal: (): Ctor<Error> => class extends Error {},
};
