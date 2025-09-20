import * as P from "effect/Predicate";
import { IHeaders } from "./IHeaders";
import { HeaderValidationError } from "./errors";

export const validateHeaders = (headers: unknown) => {
	const isValid = P.isRecord(headers);

	if (!isValid) {
		throw new HeaderValidationError(headers);
	}

	try {
		new Headers(Object.entries(headers) as any);
		return headers as IHeaders;
	} catch {
		throw new HeaderValidationError(headers);
	}
};
