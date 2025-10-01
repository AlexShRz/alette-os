export const parseResponseHeaders = (stringifiedHeaders: string) => {
	const headers: Record<string, string> = {};
	const raw = stringifiedHeaders;

	if (!raw) {
		return headers;
	}

	raw
		.trim()
		.split(/[\r\n]+/)
		.forEach((line) => {
			const parts = line.split(": ");
			const header = parts.shift();

			if (!header) {
				return;
			}

			headers[header.toLowerCase()] = parts.join(": ");
		});

	return headers;
};
