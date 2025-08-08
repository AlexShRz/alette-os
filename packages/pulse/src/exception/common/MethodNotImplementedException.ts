import { FatalApiException } from "./FatalApiException.js";

export class MethodNotImplementedException extends FatalApiException {
	constructor(nonImplementedMethodLocation: string, methodName: string) {
		super(
			`[${nonImplementedMethodLocation}] - method '${methodName}' was not implemented.`,
		);
	}
}
