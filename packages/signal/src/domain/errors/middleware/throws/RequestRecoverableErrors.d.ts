import type { ApiError } from "@alette/pulse";
import { TDeepMergeAsOpaqueValue } from "@alette/type-utils";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";

export interface IRecognizedRequestError<Error extends ApiError = ApiError>
	extends Ctor<Error> {}

export type TExtractErrorInstances<
	ErrorsConstructors extends IRecognizedRequestError[],
> = ErrorsConstructors extends IRecognizedRequestError<infer E>[] ? E : never;

export type TAddDefaultRequestErrors<
	C extends IRequestContext,
	ErrorsConstructors extends IRecognizedRequestError[],
	Errors = TExtractErrorInstances<ErrorsConstructors>,
> = IRequestContextPatch<
	{
		types: {
			originalErrorType: TDeepMergeAsOpaqueValue<Errors>;
			errorType: TDeepMergeAsOpaqueValue<Errors>;
		};
	},
	"merge"
>;
