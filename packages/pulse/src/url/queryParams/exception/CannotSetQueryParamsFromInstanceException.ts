import { UrlQueryParamsBuilderException } from "./UrlQueryParamsBuilderException";

export class CannotSetQueryParamsFromInstanceException extends UrlQueryParamsBuilderException {
	constructor(instance: URLSearchParams, originalError: unknown) {
		super(
			CannotSetQueryParamsFromInstanceException.message()
				.setName("CannotSetQueryParamsFromInstanceException")
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
