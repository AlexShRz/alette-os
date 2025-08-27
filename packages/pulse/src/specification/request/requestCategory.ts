import { RequestCategory } from "../specTypes";

export const requestCategory = <T extends string>(
	name: T & (string extends T ? never : T),
): RequestCategory<T> => name as unknown as RequestCategory<T>;
