import * as E from "effect/Effect";
import { RequestRecognizedErrors } from "./meta/RequestRecognizedErrors";
import { RequestValueAdapters } from "./meta/RequestValueAdapters";

export class RequestMeta extends E.Service<RequestMeta>()("RequestMeta", {
	dependencies: [RequestRecognizedErrors.Default, RequestValueAdapters.Default],
	scoped: E.gen(function* () {
		const errors = yield* RequestRecognizedErrors;
		const valueAdapters = yield* RequestValueAdapters;

		return {
			getErrorConfig() {
				return errors;
			},

			getValueAdapterConfig() {
				return valueAdapters;
			},
		};
	}),
}) {}
