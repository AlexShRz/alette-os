import { THttpMethod } from "./HttpMethod";
import { HttpMethodValidationError } from "./errors";

export const validateHttpMethod = (method: unknown) => {
	const isString = typeof method === "string";
	const allowed: THttpMethod[] = [
		"GET",
		"PUT",
		"POST",
		"PATCH",
		"DELETE",
		"OPTIONS",
		"HEAD",
	];

	if (!isString || !allowed.includes(method as THttpMethod)) {
		throw new HttpMethodValidationError(method);
	}

	return method as THttpMethod;
};
