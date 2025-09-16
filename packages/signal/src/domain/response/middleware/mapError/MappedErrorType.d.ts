import type { ApiError } from "@alette/pulse";

export interface IMappedErrorType<ErrorType extends ApiError = unknown> {
	errorType: ErrorType;
}
