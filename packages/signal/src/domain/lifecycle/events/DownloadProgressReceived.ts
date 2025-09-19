import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";

export interface IDownloadProgressData {
	/**
	 * 1. Represents download progress in
	 * percentage.
	 * 2. Can be null if remaining byte amount is not known.
	 * This can happen if the "Content-Length" headers was not set by the server.
	 * */
	progress: number | null;
	/**
	 * Download data in bytes
	 * */
	downloaded: number;
	/**
	 * 1. Remaining data to be downloaded in bytes.
	 * 2. Can be null if content length header was not set.
	 * */
	remaining: number | null;
}

export class DownloadProgressReceived extends RequestSessionEvent {
	constructor(protected receivedData: IDownloadProgressData) {
		super();
	}

	getProgressData() {
		return this.receivedData;
	}

	protected _clone() {
		return new DownloadProgressReceived({
			...this.receivedData,
		}) as this;
	}
}
