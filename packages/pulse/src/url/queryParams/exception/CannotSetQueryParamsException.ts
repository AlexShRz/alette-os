import { UrlQueryParamsBuilderException } from "./UrlQueryParamsBuilderException";

export class CannotSetQueryParamsException extends UrlQueryParamsBuilderException {
	constructor(queryParams: unknown, originalError: unknown) {
		super(
			CannotSetQueryParamsException.message()
				.setName("CannotSetQueryParamsException")
				.addNewLineMessage(`Cannot set url query params.`)
				.addNewLineMessage(`Query params are invalid.`)
				.setContext({ attemptedQueryParams: queryParams })
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
