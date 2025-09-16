import * as E from "effect/Effect";
import { RequestArgumentAdapters } from "./meta/RequestArgumentAdapters";
import { RequestMountModeMeta } from "./meta/RequestMountModeMeta";
import { RequestRecognizedErrors } from "./meta/RequestRecognizedErrors";
import { RequestValueAdapters } from "./meta/RequestValueAdapters";

/**
 * Request meta does not care about request id and
 * wiped ONLY after our request middleware tree has been disposed of.
 * */
export class RequestMeta extends E.Service<RequestMeta>()("RequestMeta", {
	dependencies: [
		RequestRecognizedErrors.Default,
		RequestValueAdapters.Default,
		RequestArgumentAdapters.Default,
		RequestMountModeMeta.Default,
	],
	scoped: E.gen(function* () {
		const errors = yield* RequestRecognizedErrors;
		const valueAdapters = yield* RequestValueAdapters;
		const argumentAdapters = yield* RequestArgumentAdapters;
		const mountModeMeta = yield* RequestMountModeMeta;

		return {
			getErrorConfig() {
				return errors;
			},

			getValueAdapterConfig() {
				return valueAdapters;
			},

			getMountModeMeta() {
				return mountModeMeta;
			},

			getArgumentAdapterConfig() {
				return argumentAdapters;
			},
		};
	}),
}) {}
