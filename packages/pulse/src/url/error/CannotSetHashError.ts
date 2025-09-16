import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetHashError extends UrlBuilderError {
	constructor(hash: string, originalError: unknown) {
		super(
			CannotSetHashError.message()
				.setName("CannotSetHashError")
				.addNewLineMessage(`Cannot set hash using - "${hash}".`)
				.addNewLineMessage(`The hash is invalid.`)
				.toString(),
		);
	}
}
