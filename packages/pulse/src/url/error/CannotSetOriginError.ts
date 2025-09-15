import { UrlBuilderError } from "./UrlBuilderError";

export class CannotSetOriginError extends UrlBuilderError {
	constructor(origin: string, originalError: unknown) {
		super(
			CannotSetOriginError.message()
				.setName("CannotSetOriginError")
				.addNewLineMessage(`Cannot set origin using - "${origin}".`)
				.toString(),
			{
				cause: originalError,
			},
		);
	}
}
