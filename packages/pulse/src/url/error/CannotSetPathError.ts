import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetPathError extends UrlBuilderError {
	constructor(path: string, originalError: unknown) {
		super(
			CannotSetPathError.message()
				.setName("CannotSetPathError")
				.addNewLineMessage(`Cannot set path using - "${path}".`)
				.addNewLineMessage(`The path is invalid.`)
				.toString(),
		);
	}
}
