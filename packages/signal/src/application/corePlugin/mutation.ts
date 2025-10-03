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
	runOnMount,
} from "../../domain";
import { requestSpecification } from "../../domain/specification";
import { blueprint } from "../oneShotRequest";
import { withRecognizedErrors } from "./sharedMiddleware";

export const mutationCategory = requestCategory("baseMutation");

export const mutationRequestSpec = requestSpecification()
	.categorizedAs(baseRequest, mutationCategory)
	.accepts(...allRequestMiddleware)
	.prohibits(factoryMiddlewareName)
	.build();

export const mutationFactory = blueprint()
	.specification(
		requestSpecification()
			.accepts(...allRequestMiddleware, factoryMiddlewareName)
			.build(),
	)
	.use(
		origin(),
		runOnMount(false),
		reloadable(),
		posts(),
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

			return base.execute();
		}),
		withRecognizedErrors(),
	)
	.specification(mutationRequestSpec);
