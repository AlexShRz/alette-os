import { UrlQueryParamsBuilderError } from "./UrlQueryParamsBuilderError";

export class CannotSetQueryParamsFromInstanceError extends UrlQueryParamsBuilderError {
	constructor(instance: URLSearchParams, originalError: unknown) {
		super(
			CannotSetQueryParamsFromInstanceError.message()
				.setName("CannotSetQueryParamsFromInstanceError")
				.addNewLineMessage(
					`Cannot set query params from URLSearchParams instance.`,
				)
				.addNewLineMessage(`The instance is invalid.`)
				.setContext({ attemptedSearchParamInstance: instance })
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
