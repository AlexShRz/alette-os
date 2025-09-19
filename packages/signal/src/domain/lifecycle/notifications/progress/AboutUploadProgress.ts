import * as E from "effect/Effect";
import {
	IUploadProgressData,
	UploadProgressReceived,
} from "../../events/UploadProgressReceived";
import { OneShotRequestNotification } from "../OneShotRequestNotification";

export const aboutUploadProgress = (data: IUploadProgressData) =>
	new AboutUploadProgress(data);

export class AboutUploadProgress extends OneShotRequestNotification {
	constructor(protected data: IUploadProgressData) {
		super();
	}

	toEvent() {
		return E.succeed(new UploadProgressReceived(this.data));
	}
}
