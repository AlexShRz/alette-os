import { ApiError, makeErrorMessage } from "../../../error";

export abstract class UrlQueryParamsBuilderError extends ApiError.AsFatal(
	"UrlQueryParamsBuilderError",
) {
	protected static message() {
		return makeErrorMessage()
			.setName("UnknownUrlQueryParamsBuilderError")
			.addNewLineMessage("[UrlQueryParamsBuilder]");
	}
}
