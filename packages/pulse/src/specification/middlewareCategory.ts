import { MiddlewareCategory } from "./specTypes";

export const middlewareCategory = <T extends string>(
	name: T & (string extends T ? never : T),
): MiddlewareCategory<T> => name as unknown as MiddlewareCategory<T>;
