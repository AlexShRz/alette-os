import { IUploadProgressData } from "@alette/pulse";
import { RequestSessionEvent } from "../../execution/events/RequestSessionEvent";

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
