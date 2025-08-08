import { ExceptionLogMessageBuilder } from "./ExceptionLogMessageBuilder";

export const makeExceptionMessage = (message?: string) => {
	const builder = new ExceptionLogMessageBuilder();
	return message ? builder.addNewLineMessage(message) : builder;
};
