import { ErrorLogMessageBuilder } from "./ErrorLogMessageBuilder";

export const makeErrorMessage = (message?: string) => {
	const builder = new ErrorLogMessageBuilder();
	return message ? builder.addNewLineMessage(message) : builder;
};
