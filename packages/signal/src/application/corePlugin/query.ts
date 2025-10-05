import { THttpStatusCode, r, request } from "@alette/pulse";
import {
	aboutDownloadProgress,
	aboutUploadProgress,
	allRequestMiddleware,
	baseRequest,
	bodyMiddlewareName,
	factory,
	factoryMiddlewareName,
	gets,
	hasCredentials,
	hasHeaders,
	methodMiddlewareName,
	origin,
	reloadable,
	requestCategory,
	requestSpecification,
	retry,
	runOnMount,
	tapUploadProgressMiddlewareName,
} from "../../domain";
import { blueprint } from "../oneShotRequest";
import { withRecognizedErrors } from "./sharedMiddleware";

export const queryCategory = requestCategory("baseQuery");

export const QUERY_RETRY_STATUSES: THttpStatusCode[] = [
	408, 409, 425, 429, 500, 502, 503, 504,
];

const querySpec = requestSpecification()
	.categorizedAs(baseRequest, queryCategory)
	.accepts(...allRequestMiddleware)
	.prohibits(
		methodMiddlewareName,
		factoryMiddlewareName,
		bodyMiddlewareName,
		tapUploadProgressMiddlewareName,
	)
	.build();

export const queryFactory = blueprint()
	.specification(
		requestSpecification()
			.accepts(...allRequestMiddleware, factoryMiddlewareName)
			.build(),
	)
	.use(
		origin(),
		runOnMount(),
		reloadable(),
		gets(),
		factory((config, { signal, notify }) => {
			const { url, method } = config;

			let base = request(
				r.route(url),
				r.method(method),
				r.signal(signal),
				r.withCookies(),
				r.onUploadProgress((data) => notify(aboutUploadProgress(data))),
				r.onDownloadProgress((data) => notify(aboutDownloadProgress(data))),
			);

			if (hasHeaders(config)) {
				base = base.with(r.headers(config.headers));
			}

			if (hasCredentials(config)) {
				base = base.with(r.withCookies());
			}

			return base.execute();
		}),
		withRecognizedErrors(),
		retry({
			times: 1,
			whenStatus: QUERY_RETRY_STATUSES,
		}),
	)
	.specification(querySpec);
