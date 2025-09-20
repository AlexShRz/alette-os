import * as P from "effect/Predicate";
import { THttpBody } from "./HttpBody";
import { BodyValidationError } from "./errors";

export const validateBody = (body: unknown) => {
	const isValid =
		P.isRecord(body) ||
		typeof body === "string" ||
		body instanceof Blob ||
		body instanceof ArrayBuffer ||
		body instanceof FormData ||
		body instanceof URLSearchParams ||
		body instanceof Uint8Array;

	if (!isValid) {
		throw new BodyValidationError(body);
	}

	return body as THttpBody;
};
