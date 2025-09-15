import { UrlBuilderError } from "./UrlBuilderError";

export class CannotCreateUrlError extends UrlBuilderError {
	constructor(attemptedUrl: string, originalError: unknown) {
		super(
			CannotCreateUrlError.message()
				.setName("CannotCreateUrlError")
				.addNewLineMessage(`Cannot create url from - "${attemptedUrl}".`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
