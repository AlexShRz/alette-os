import { FatalApiError, makeErrorMessage } from "../../../error";

export abstract class UrlQueryParamsBuilderError extends FatalApiError {
	protected static message() {
		return makeErrorMessage()
			.setName("UnknownUrlQueryParamsBuilderError")
			.addNewLineMessage("[UrlQueryParamsBuilder]");
	}
}
