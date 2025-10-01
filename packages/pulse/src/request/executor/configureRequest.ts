import { IRequestProps } from "./RequestExecutor";

const setHeaders = ({ request, data: { headers } }: IRequestProps) => {
	Object.entries(headers || {}).forEach(([header, value]) => {
		request.setRequestHeader(header, value);
	});
};

const setCredentials = ({ request, data: { credentials } }: IRequestProps) => {
	if (credentials === "include") {
		request.withCredentials = true;
	}
};

const setResponseType = ({
	request,
	data: { responseType },
}: IRequestProps) => {
	request.responseType = responseType;
};

const sendWithBody = ({ request, data: { body } }: IRequestProps) => {
	if (body === undefined) {
		return request.send();
	}

	if (
		typeof body === "string" ||
		body instanceof FormData ||
		body instanceof Blob ||
		body instanceof Uint8Array ||
		body instanceof ArrayBuffer
	) {
		return request.send(body);
	}

	if (body instanceof URLSearchParams) {
		return request.send(body.toString());
	}

	return request.send(JSON.stringify(body));
};

const setAbortHandler = ({ request, data: { signal } }: IRequestProps) => {
	if (!signal) {
		return;
	}

	signal.addEventListener(
		"abort",
		() => {
			request.abort();
		},
		{ once: true },
	);
};

export const configureRequest = (props: IRequestProps) => {
	const {
		request,
		data: { route, method },
	} = props;
	const url = route.build();

	/**
	 * 1. Open request first
	 * 2. This is needed to set headers.
	 * */
	request.open(method, url, true);
	setResponseType(props);
	setHeaders(props);
	setCredentials(props);
	setAbortHandler(props);

	return {
		request,
		execute: () => {
			sendWithBody(props);
		},
	};
};
