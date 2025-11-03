import { THttpStatusCode, r, request } from "@alette/pulse";
import {
	IAnyRequestSpecification,
	TVerifyMiddlewareCompatibility,
	TVerifyMiddlewareSupplier,
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
	method,
	methodMiddlewareName,
	origin,
	reloadable,
	requestCategory,
	requestSpecification,
	retry,
	runOnMount,
	tapUploadProgressMiddlewareName,
	throwsMiddlewareName,
} from "../../domain";
import { TAnyMiddlewareFacade } from "../../domain/middleware/facade/TAnyMiddlewareFacade";
import { blueprint } from "../oneShotRequest";
import { withRecognizedErrors } from "./sharedMiddleware";

export const queryCategory = requestCategory("baseQuery");

export const QUERY_RETRY_STATUSES: THttpStatusCode[] = [
	401, 408, 409, 419, 425, 429, 500, 502, 503, 504,
];

const querySpec = requestSpecification()
	.categorizedAs(baseRequest, queryCategory)
	.accepts(...allRequestMiddleware)
	.prohibits(
		methodMiddlewareName,
		factoryMiddlewareName,
		bodyMiddlewareName,
		throwsMiddlewareName,
		tapUploadProgressMiddlewareName,
	)
	.build();

// const tasdsa = blueprint()
// 	.specification(
// 		requestSpecification()
// 			.accepts(...allRequestMiddleware, factoryMiddlewareName)
// 			.prohibits(methodMiddlewareName)
// 			.build(),
// 	)
// 	.use(method)
// 	.build();

const heyyy = method("POST");

const spec = requestSpecification()
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	// .prohibits(methodMiddlewareName)
	.build();

type TSpec<T> = T extends TAnyMiddlewareFacade<any, infer Spec, any, any>
	? Spec
	: false;

// type asdasd = TVerifyMiddlewareSupplier<typeof spec, typeof heyyy>;
type asdasd = TVerifyMiddlewareCompatibility<
	typeof spec,
	TSpec<typeof heyyy>,
	typeof heyyy
>;

type asdasdas = TSpec<typeof heyyy>;

//
// heyyy.getArgs();
//
const asdasd = blueprint()
	.specification(
		requestSpecification()
			.accepts(...allRequestMiddleware, factoryMiddlewareName)
			.prohibits(methodMiddlewareName)
			.build(),
	)
	.use(
		heyyy,
		// method(({ method }) => "GET" as const),
		// // {},
		// method(({ method }) => "PATCH" as const),
		// method(({ method }) => "GET" as const),
		// method("DELETE"),
	);
// .use(heyyy);
// .build();

// export const queryFactory = blueprint()
// 	.specification(
// 		requestSpecification()
// 			.accepts(...allRequestMiddleware, factoryMiddlewareName)
// 			.build(),
// 	)
// 	.use(
// 		origin(),
// 		runOnMount(),
// 		reloadable(),
// 		gets(),
// 		factory((config, { signal, notify }) => {
// 			const { url, method } = config;
//
// 			let base = request(
// 				r.route(url),
// 				r.method(method),
// 				r.signal(signal),
// 				r.withCookies(),
// 				r.onUploadProgress((data) => notify(aboutUploadProgress(data))),
// 				r.onDownloadProgress((data) => notify(aboutDownloadProgress(data))),
// 			);
//
// 			if (hasHeaders(config)) {
// 				base = base.with(r.headers(config.headers));
// 			}
//
// 			if (hasCredentials(config)) {
// 				base = base.with(r.withCookies());
// 			}
//
// 			return base.execute();
// 		}),
// 		withRecognizedErrors(),
// 		retry({
// 			times: 1,
// 			whenStatus: QUERY_RETRY_STATUSES,
// 		}),
// 	)
// 	.specification(querySpec);
