import { UrlBuilderError } from "./UrlBuilderError";

export class CannotCreateUrlFromInstanceError extends UrlBuilderError {
	constructor(urlInstance: URL, originalError: unknown) {
		super(
			CannotCreateUrlFromInstanceError.message()
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
