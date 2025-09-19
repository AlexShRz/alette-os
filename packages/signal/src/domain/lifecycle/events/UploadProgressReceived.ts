import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";

export interface IUploadProgressData {
	/**
	 * 1. Represents upload progress as a percentage (0–100).
	 * 2. Can be null if the total size is unknown
	 * (e.g., if the "Content-Length" header was not provided).
	 */
	progress: number | null;
	/**
	 * Number of bytes uploaded so far.
	 */
	uploaded: number;
	/**
	 * Remaining number of bytes to upload.
	 * Can be null if the total size is unknown.
	 */
	remaining: number | null;
}

export class UploadProgressReceived extends RequestSessionEvent {
	constructor(protected receivedData: IUploadProgressData) {
		super();
	}

	getProgressData() {
		return this.receivedData;
	}

	protected _clone() {
		return new UploadProgressReceived({
			...this.receivedData,
		}) as this;
	}
}
