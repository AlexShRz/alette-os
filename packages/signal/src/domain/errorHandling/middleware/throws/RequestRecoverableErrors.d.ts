import { ApiException } from "@alette/pulse";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";

export interface IRecoverableApiError<
	Exception extends ApiException = ApiException,
> extends Ctor<Exception> {}

export type TGetRequestErrors<C extends IRequestContext> =
	C["types"]["errorType"];

type TExtractErrorInstances<ErrorsConstructors extends IRecoverableApiError[]> =
	ErrorsConstructors extends IRecoverableApiError<infer E>[] ? E : never;

export type TAddDefaultRequestErrors<
	C extends IRequestContext,
	ErrorsConstructors extends IRecoverableApiError[],
	Errors = TExtractErrorInstances<ErrorsConstructors>,
> = C["types"]["errorType"] extends ApiException
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
