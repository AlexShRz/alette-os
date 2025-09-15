import { ApiError, makeErrorMessage } from "../../error";

export abstract class UrlBuilderError extends ApiError.AsFatal(
	"UrlBuilderError",
) {
	protected static message() {
		return makeErrorMessage()
			.setName("UnknownUrlBuilderError")
			.addNewLineMessage("[Url Builder]");
	}
}
