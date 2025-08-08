import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetHashException extends UrlBuilderException {
	constructor(hash: string, originalError: unknown) {
		super(
			CannotSetHashException.message()
				.setName("CannotSetHashException")
				.addNewLineMessage(`Cannot set hash using - "${hash}".`)
				.addNewLineMessage(`The hash is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
