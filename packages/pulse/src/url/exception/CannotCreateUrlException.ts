import { UrlBuilderException } from "./UrlBuilderException";

export class CannotCreateUrlException extends UrlBuilderException {
	constructor(attemptedUrl: string, originalError: unknown) {
		super(
			CannotCreateUrlException.message()
				.setName("CannotCreateUrlException")
				.addNewLineMessage(`Cannot create url from - "${attemptedUrl}".`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
