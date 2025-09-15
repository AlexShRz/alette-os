import { ApiException, makeExceptionMessage } from "../../exception";

export abstract class UrlBuilderException extends ApiException.AsFatal(
	"UrlBuilderException",
) {
	protected static message() {
		return makeExceptionMessage()
			.setName("UnknownUrlBuilderException")
			.addNewLineMessage("[Url Builder]");
	}
}
