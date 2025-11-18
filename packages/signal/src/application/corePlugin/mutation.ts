import { HttpMethodValidationError, r, request } from "@alette/pulse";
import {
	aboutDownloadProgress,
	aboutUploadProgress,
	allRequestMiddleware,
	baseRequest,
	factory,
	factoryMiddlewareName,
	hasBody,
	hasCredentials,
	hasHeaders,
	origin,
	posts,
	reloadable,
	requestCategory,
	retry,
	runOnMount,
	throws,
	throwsMiddlewareName,
} from "../../domain";
import { requestSpecification } from "../../domain/specification";
import { blueprint } from "../oneShotRequest";

export const mutationCategory = requestCategory("baseMutation");

export const mutationRequestSpec = requestSpecification()
	.categorizedAs(baseRequest, mutationCategory)
	.accepts(...allRequestMiddleware)
	.prohibits(factoryMiddlewareName, throwsMiddlewareName)
	.build();

export const mutationFactory = blueprint()
	.specification(
		requestSpecification()
			.accepts(...allRequestMiddleware, factoryMiddlewareName)
			.build(),
	)
	.use(
		origin,
		reloadable,
		posts,
		runOnMount(false),
		factory((config, { signal, notify }) => {
			const { url, method } = config;

			if ((method as string) === "GET") {
				throw new HttpMethodValidationError(method);
			}

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

			if (hasBody(config)) {
				base = base.with(r.body(config.body));
			}

			return base();
		}),
		throws,
		retry({
			times: 1,
			whenStatus: [401, 419],
		}),
	)
	.specification(mutationRequestSpec);
