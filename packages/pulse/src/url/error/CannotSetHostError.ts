import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetHostError extends UrlBuilderError {
	constructor(host: string, originalError: unknown) {
		super(
			CannotSetHostError.message()
				.setName("CannotSetHostError")
				.addNewLineMessage(`Cannot set url host using - "${host}".`)
				.addNewLineMessage(`The host is invalid.`)
				.toString(),
		);
	}
}
