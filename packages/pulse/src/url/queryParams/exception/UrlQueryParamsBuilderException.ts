import { FatalApiException, makeExceptionMessage } from "../../../exception";

export abstract class UrlQueryParamsBuilderException extends FatalApiException {
	protected static message() {
		return makeExceptionMessage()
			.setName("UnknownUrlQueryParamsBuilderException")
			.addNewLineMessage("[UrlQueryParamsBuilder]");
	}
}
