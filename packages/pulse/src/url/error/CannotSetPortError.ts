import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetPortError extends UrlBuilderError {
	constructor(port: string, originalError: unknown) {
		super(
			CannotSetPortError.message()
				.setName("CannotSetPortError")
				.addNewLineMessage(`Cannot set url port using - "${port}".`)
				.addNewLineMessage(`The port is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
