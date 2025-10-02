import * as E from "effect/Effect";
import {
	IDownloadProgressData,
	IUploadProgressData,
} from "../../RequestProgress";

export interface IUploadProgressSubscriber {
	(data: IUploadProgressData): void;
}

export interface IDownloadProgressSubscriber {
	(data: IDownloadProgressData): void;
}

export class ProgressBroadcaster extends E.Service<ProgressBroadcaster>()(
	"ProgressBroadcaster",
	{
		accessors: true,
		scoped: E.gen(function* () {
			const uploadProgressSubscribers: IUploadProgressSubscriber[] = [];
			const downloadProgressSubscribers: IDownloadProgressSubscriber[] = [];

			const getProgress = ({ loaded, total }: ProgressEvent) =>
				Number(((loaded / total) * 100).toFixed(2));

			return {
				notifyAboutUploadProgress(event: ProgressEvent) {
					if (!uploadProgressSubscribers.length) {
						return;
					}

					const { lengthComputable, loaded, total } = event;
					const data: IUploadProgressData = {
						progress: lengthComputable ? getProgress(event) : null,
						uploaded: loaded,
						remaining: total,
					};

					uploadProgressSubscribers.forEach((subscriber) => subscriber(data));
				},

				notifyAboutDownloadProgress(event: ProgressEvent) {
					if (!downloadProgressSubscribers.length) {
						return;
					}

					const { lengthComputable, loaded, total } = event;
					const data: IDownloadProgressData = {
						progress: lengthComputable ? getProgress(event) : null,
						downloaded: loaded,
						remaining: total,
					};

					downloadProgressSubscribers.forEach((subscriber) => subscriber(data));
				},

				addUploadProgressSubscriber(subscriber: IUploadProgressSubscriber) {
					uploadProgressSubscribers.push(subscriber);
				},

				addDownloadProgressSubscriber(subscriber: IDownloadProgressSubscriber) {
					downloadProgressSubscribers.push(subscriber);
				},
			};
		}),
	},
) {}
