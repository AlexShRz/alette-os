import { ClientRequest } from "http";
import { formDataToBuffer } from "./utils/formDataToBuffer";
import { XMLHttpRequestEventTarget } from "./xml-http-request-event-target";

export class XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
	private _contentType: string | null = null;
	private _body: any = null;

	constructor() {
		super();
		this._reset();
	}

	_reset() {
		this._contentType = null;
		this._body = null;
	}

	async _setData(
		data?: string | Blob | Buffer | ArrayBuffer | ArrayBufferView | FormData,
	) {
		if (data == null) {
			return;
		}

		/**
		 * Simulate automatic browser headers set for form data
		 * */
		if (data instanceof FormData) {
			const { buffer, boundary } = await formDataToBuffer(data);
			this._contentType = `multipart/form-data; boundary=${boundary}`;
			this._body = Buffer.from(buffer);
			return;
		}

		if (data instanceof Blob) {
			this._contentType = `application/octet-stream`;
			this._body = Buffer.from(await data.arrayBuffer());
			return;
		}

		if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
			const body = Buffer.alloc(data.byteLength);
			const view = new Uint8Array(data);
			for (let i = 0; i < data.byteLength; i++) {
				const chunk = view[i];
				if (chunk) {
					body[i] = chunk;
				}
			}
			this._contentType = `application/octet-stream`;
			this._body = body;
			return;
		}

		if (typeof data === "string") {
			if (data.length !== 0) {
				this._contentType = "text/plain;charset=UTF-8";
			}
			this._body = Buffer.from(data, "utf-8");
		} else if (Buffer.isBuffer(data)) {
			this._body = data;
		} else if (data.buffer && data.buffer instanceof ArrayBuffer) {
			const body = Buffer.alloc(data.byteLength);
			const offset = data.byteOffset;
			const view = new Uint8Array(data.buffer);
			for (let i = 0; i < data.byteLength; i++) {
				const chunk = view[i + offset];
				if (chunk) {
					body[i] = chunk;
				}
			}
			this._body = body;
		} else {
			throw new Error(`Unsupported send() data ${data}`);
		}
	}

	_finalizeHeaders(
		headers: Record<string, string>,
		loweredHeaders: Record<string, string>,
	) {
		if (this._contentType && !loweredHeaders["content-type"]) {
			headers["Content-Type"] = this._contentType;
		}
		if (this._body) {
			headers["Content-Length"] = this._body.length.toString();
		}
	}

	_startUpload(request: ClientRequest) {
		if (this._body) {
			request.write(this._body);
		}
		request.end();
	}
}
