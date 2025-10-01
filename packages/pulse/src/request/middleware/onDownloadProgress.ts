import * as E from "effect/Effect";
import { IRequestMiddleware } from "../RequestTypes";
import {
	IDownloadProgressSubscriber,
	ProgressBroadcaster,
} from "../services/ProgressBroadcaster";

export const onDownloadProgress =
	(subscriber: IDownloadProgressSubscriber): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				yield* ProgressBroadcaster.addDownloadProgressSubscriber(subscriber);
			}),
		);
