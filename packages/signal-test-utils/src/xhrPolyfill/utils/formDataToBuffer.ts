import { Buffer } from "buffer";

export const formDataToBuffer = async (fd: FormData) => {
	const boundary = "----formdata-" + Math.random().toString(36).slice(2);

	const chunks: Buffer[] = [];

	for (const [name, value] of fd.entries()) {
		chunks.push(Buffer.from(`--${boundary}\r\n`));

		if (typeof value === "string") {
			// Normal text field
			chunks.push(
				Buffer.from(
					`Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
				),
			);
		} else {
			// File or Blob
			const filename = (value as File).name ?? "blob";
			const type = (value as File).type || "application/octet-stream";

			chunks.push(
				Buffer.from(
					`Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
						`Content-Type: ${type}\r\n\r\n`,
				),
			);

			const ab = await value.arrayBuffer();
			chunks.push(Buffer.from(ab));
			chunks.push(Buffer.from("\r\n"));
		}
	}

	chunks.push(Buffer.from(`--${boundary}--\r\n`));

	return {
		buffer: Buffer.concat(chunks),
		boundary,
	};
};
