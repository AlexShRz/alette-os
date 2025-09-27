import type { ApiError } from "@alette/pulse";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";

export interface IRecognizedRequestError<Error extends ApiError = ApiError>
	extends Ctor<Error> {}

type TExtractErrorInstances<
	ErrorsConstructors extends IRecognizedRequestError[],
> = ErrorsConstructors extends IRecognizedRequestError<infer E>[] ? E : never;

export type TAddDefaultRequestErrors<
	C extends IRequestContext,
	ErrorsConstructors extends IRecognizedRequestError[],
	Errors = TExtractErrorInstances<ErrorsConstructors>,
> = C["types"]["originalErrorType"] extends ApiError
	? TMergeRecords<
			C["types"],
			{
				/**
				 * Merge errors our prev errors are not of "unknown" type.
				 * */
				originalErrorType: Errors | C["types"]["originalErrorType"];
				errorType: Errors | C["types"]["originalErrorType"];
			}
		>
	: TMergeRecords<C["types"], { errorType: Errors; originalErrorType: Errors }>;
