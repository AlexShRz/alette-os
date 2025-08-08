import { UrlBuilderException } from "./UrlBuilderException";

export class CannotCreateUrlFromInstanceException extends UrlBuilderException {
	constructor(urlInstance: URL, originalError: unknown) {
		super(
			CannotCreateUrlFromInstanceException.message()
				.setName("CannotCreateUrlFromInstance")
				.addNewLineMessage(`Cannot create url from URL instance.`)
				.addNewLineMessage(`Instance data: "${urlInstance.toString()}"`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
