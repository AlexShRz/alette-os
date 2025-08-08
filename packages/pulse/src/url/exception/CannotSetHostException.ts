import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetHostException extends UrlBuilderException {
	constructor(host: string, originalError: unknown) {
		super(
			CannotSetHostException.message()
				.setName("CannotSetHostException")
				.addNewLineMessage(`Cannot set url host using - "${host}".`)
				.addNewLineMessage(`The host is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
