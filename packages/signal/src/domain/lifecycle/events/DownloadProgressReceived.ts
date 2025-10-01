import { IDownloadProgressData } from "@alette/pulse";
import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";

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
