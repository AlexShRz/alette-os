import { ApiException, makeExceptionMessage } from "../../../exception";

export abstract class UrlQueryParamsBuilderException extends ApiException.AsFatal(
	"UrlQueryParamsBuilderException",
) {
	protected static message() {
		return makeExceptionMessage()
			.setName("UnknownUrlQueryParamsBuilderException")
			.addNewLineMessage("[UrlQueryParamsBuilder]");
	}
}
