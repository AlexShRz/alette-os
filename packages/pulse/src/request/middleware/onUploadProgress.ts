import * as E from "effect/Effect";
import { IRequestMiddleware } from "../RequestTypes";
import {
	IUploadProgressSubscriber,
	ProgressBroadcaster,
} from "../services/ProgressBroadcaster";

export const onUploadProgress =
	(subscriber: IUploadProgressSubscriber): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				yield* ProgressBroadcaster.addUploadProgressSubscriber(subscriber);
			}),
		);
