import { UrlBuilderException } from "./UrlBuilderException";

export class CannotSetOriginException extends UrlBuilderException {
	constructor(origin: string, originalError: unknown) {
		super(
			CannotSetOriginException.message()
				.setName("CannotSetOriginException")
				.addNewLineMessage(`Cannot set origin using - "${origin}".`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
