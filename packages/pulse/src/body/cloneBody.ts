import { THttpBody } from "./HttpBody";
import { BodyCloningError } from "./errors";

const cloneFormData = (originalData: FormData) => {
	const clone = new FormData();
	for (const [key, value] of originalData.entries()) {
		clone.append(key, value);
	}

	return clone;
};

const clonePassedBody = (body: THttpBody) => {
	if (typeof body === "string") {
		return body;
	}

	if (
		body instanceof Blob ||
		body instanceof Uint8Array ||
		body instanceof ArrayBuffer
	) {
		return body.slice();
	}

	if (body instanceof URLSearchParams) {
		return new URLSearchParams(body);
	}

	if (body instanceof FormData) {
		return cloneFormData(body);
	}

	return structuredClone(body);
};

export const cloneBody = (body: THttpBody) => {
	try {
		return clonePassedBody(body);
	} catch {
		throw new BodyCloningError(body);
	}
};
