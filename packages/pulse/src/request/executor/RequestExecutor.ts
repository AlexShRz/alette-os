import * as E from "effect/Effect";
import { THttpStatusCode } from "../../THttpStatusCode";
import { RequestFailedError, RequestWasCancelledError } from "../../error";
import { ProgressBroadcaster } from "../services/ProgressBroadcaster";
import { IFilledRequestData, RequestData } from "../services/RequestData";
import { configureRequest } from "./configureRequest";
import { parseResponseHeaders } from "./utils/parseResponseHeaders";

export interface IRequestProps {
	request: XMLHttpRequest;
	data: IFilledRequestData;
}

export class RequestExecutor extends E.Service<RequestExecutor>()(
	"RequestExecutor",
	{
		accessors: true,
		scoped: E.gen(function* () {
			const progress = yield* ProgressBroadcaster;

			const runRequest = E.gen(function* () {
				const props = yield* RequestData.validateAndGet();

				return yield* E.async<
					unknown,
					RequestFailedError | RequestWasCancelledError
				>((resume) => {
					const { request, execute } = configureRequest({
						request: new XMLHttpRequest(),
						data: props,
					});

					request.onreadystatechange = () => {
						if (request.readyState === 4) {
							resume(E.succeed(request.response));
						}
					};
					/**
					 * Track upload/download progress
					 * */
					request.upload.onprogress = (event) => {
						progress.notifyAboutUploadProgress(event);
					};
					request.onprogress = (event) => {
						progress.notifyAboutDownloadProgress(event);
					};

					/**
					 * Handle abort
					 * */
					request.onabort = () => {
						resume(E.fail(new RequestWasCancelledError()));
					};

					/**
					 * Handle errors
					 * */
					request.onload = () => {
						const isSuccess = request.status >= 200 && request.status < 300;

						if (isSuccess) {
							return;
						}

						resume(
							E.fail(
								new RequestFailedError({
									reason: "Client configuration error.",
									status: request.status as THttpStatusCode,
									serverResponse: request.response,
									headers: parseResponseHeaders(
										request.getAllResponseHeaders(),
									),
								}),
							),
						);
					};
					request.onerror = () => {
						resume(
							E.fail(
								new RequestFailedError({
									reason:
										"Network error. " +
										"Either you are offline, " +
										"or the server could not have been reached for other reason.",
								}),
							),
						);
					};

					execute();
				});
			});

			return {
				run() {
					return runRequest;
				},
			};
		}),
	},
) {}
