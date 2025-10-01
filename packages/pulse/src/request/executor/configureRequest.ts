import * as P from "effect/Predicate";
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

const sendWithBody = ({ request, data: { body } }: IRequestProps) => {
	if (body === undefined) {
		return request.send();
	}

	if (P.isRecord(body)) {
		return request.send(JSON.stringify(body));
	}

	if (body instanceof URLSearchParams) {
		return request.send(body.toString());
	}

	return request.send(body);
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

	setHeaders(props);
	setCredentials(props);
	setAbortHandler(props);

	return {
		request,
		execute: () => {
			request.open(method, url, true);
			sendWithBody(props);
		},
	};
};
