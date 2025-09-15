import type { ApiErrorInstance } from "@alette/pulse";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";

export interface IRecognizedRequestError<
	Error extends ApiErrorInstance = ApiErrorInstance,
> extends Ctor<Error> {}

export type TGetRecognizedRequestErrors<C extends IRequestContext> =
	C["types"]["errorType"];

type TExtractErrorInstances<
	ErrorsConstructors extends IRecognizedRequestError[],
> = ErrorsConstructors extends IRecognizedRequestError<infer E>[] ? E : never;

export type TAddDefaultRequestErrors<
	C extends IRequestContext,
	ErrorsConstructors extends IRecognizedRequestError[],
	Errors = TExtractErrorInstances<ErrorsConstructors>,
> = C["types"]["errorType"] extends ApiErrorInstance
	? TMergeRecords<
			C["types"],
			{
				/**
				 * Merge errors our prev errors are not of "unknown" type.
				 * */
				errorType: Errors | C["types"]["errorType"];
			}
		>
	: TMergeRecords<C["types"], { errorType: Errors }>;
