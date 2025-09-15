import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetProtocol extends UrlBuilderError {
	constructor(protocol: string, originalError: unknown) {
		super(
			CannotSetProtocol.message()
				.setName("CannotSetProtocol")
				.addNewLineMessage(`Cannot set url protocol using - "${protocol}".`)
				.addNewLineMessage(`The protocol is invalid.`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
