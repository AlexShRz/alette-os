import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetProtocol extends UrlBuilderException {
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
