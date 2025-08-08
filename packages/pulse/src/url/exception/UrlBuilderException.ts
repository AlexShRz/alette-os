import { FatalApiException, makeExceptionMessage } from "../../exception";

export abstract class UrlBuilderException extends FatalApiException {
	protected static message() {
		return makeExceptionMessage()
			.setName("UnknownUrlBuilderException")
			.addNewLineMessage("[Url Builder]");
	}
}
