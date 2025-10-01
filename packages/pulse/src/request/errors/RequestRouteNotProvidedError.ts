import { FatalApiError } from "../../error";

export class RequestRouteNotProvidedError extends FatalApiError {
	constructor() {
		super(
			"\nRequestRouteNotProvidedError\n" +
				"Cannot make request without a provided route.",
		);
	}
}
