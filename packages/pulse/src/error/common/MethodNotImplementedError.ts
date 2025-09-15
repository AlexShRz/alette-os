import { FatalApiError } from "./FatalApiError.js";

export class MethodNotImplementedError extends FatalApiError {
	constructor(nonImplementedMethodLocation: string, methodName: string) {
		super(
			`[${nonImplementedMethodLocation}] - method '${methodName}' was not implemented.`,
		);
	}
}
