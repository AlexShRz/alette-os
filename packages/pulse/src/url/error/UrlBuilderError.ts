import { FatalApiError, makeErrorMessage } from "../../error";

export abstract class UrlBuilderError extends FatalApiError {
	protected static message() {
		return makeErrorMessage()
			.setName("UnknownUrlBuilderError")
			.addNewLineMessage("[Url Builder]");
	}
}
