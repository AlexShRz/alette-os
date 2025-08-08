import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetPortException extends UrlBuilderException {
	constructor(port: string, originalError: unknown) {
		super(
			CannotSetPortException.message()
				.setName("CannotSetPortException")
				.addNewLineMessage(`Cannot set url port using - "${port}".`)
				.addNewLineMessage(`The port is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
