import * as E from "effect/Effect";
import { RequestCancelledError, RequestFailedError } from "../../error";
import { ProgressBroadcaster } from "../services/ProgressBroadcaster";
import { IFilledRequestData, RequestData } from "../services/RequestData";
import { configureRequest } from "./configureRequest";

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
					RequestCancelledError | RequestFailedError
				>((resume) => {
					const { request, isSuccess, getCommonErrorData, execute } =
						configureRequest({
							request: new XMLHttpRequest(),
							data: props,
						});

					request.onreadystatechange = () => {
						if (request.readyState === request.DONE && isSuccess()) {
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
						resume(new RequestCancelledError());
					};

					/**
					 * Handle errors
					 * */
					request.onload = () => {
						if (isSuccess()) {
							return;
						}

						resume(
							new RequestFailedError({
								reason: "Client configuration error.",
								...getCommonErrorData(),
							}),
						);
					};
					request.onerror = () => {
						resume(
							new RequestFailedError({
								reason:
									"Network error. " +
									"Either you are offline, " +
									"or the server could not be reached for other reason.",
								...getCommonErrorData(),
							}),
						);
					};

					execute();
				});
			});

			return {
				run() {
					return E.either(runRequest);
				},
			};
		}),
	},
) {}
