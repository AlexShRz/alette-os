import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetPathException extends UrlBuilderException {
	constructor(path: string, originalError: unknown) {
		super(
			CannotSetPathException.message()
				.setName("CannotSetPathException")
				.addNewLineMessage(`Cannot set path using - "${path}".`)
				.addNewLineMessage(`The path is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
