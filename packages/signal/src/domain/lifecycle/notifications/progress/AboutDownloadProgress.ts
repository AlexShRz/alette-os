import { IDownloadProgressData } from "@alette/pulse";
import * as E from "effect/Effect";
import { DownloadProgressReceived } from "../../events/DownloadProgressReceived";
import { OneShotRequestNotification } from "../OneShotRequestNotification";

export const aboutDownloadProgress = (data: IDownloadProgressData) =>
	new AboutDownloadProgress(data);

export class AboutDownloadProgress extends OneShotRequestNotification {
	constructor(protected data: IDownloadProgressData) {
		super();
	}

	toEvent() {
		return E.succeed(new DownloadProgressReceived(this.data));
	}
}
