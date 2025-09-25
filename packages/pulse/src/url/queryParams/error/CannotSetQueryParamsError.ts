import { UrlQueryParamsBuilderError } from "./UrlQueryParamsBuilderError";

export class CannotSetQueryParamsError extends UrlQueryParamsBuilderError {
	constructor(queryParams: unknown, originalError: unknown) {
		super(
			CannotSetQueryParamsError.message()
				.setName("CannotSetQueryParamsError")
				.addNewLineMessage(`Cannot set url query params.`)
				.addNewLineMessage(`Query params are invalid.`)
				.setContext({ attemptedQueryParams: queryParams })
				.toString(),
		);
	}
}
