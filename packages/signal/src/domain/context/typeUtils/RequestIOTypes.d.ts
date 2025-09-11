import { RequestInterruptedException } from "../../../shared/exception/RequestInterruptedException";
import { IGlobalContext } from "../IGlobalContext";
import { IRequestContext } from "../IRequestContext";
import { TMergeRecords } from "./TMergeRecords";

export type TRequestArguments<C extends IRequestContext> = C["accepts"];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> =
	| C["types"]["errorType"]
	| RequestInterruptedException;

export type TGetRequestContextWithoutGlobalContext<
	C extends IRequestContext = IRequestContext,
> = TMergeRecords<C["value"], C["settings"]>;

export type TGetAllRequestContext<C extends IRequestContext = IRequestContext> =
	TGetRequestContextWithoutGlobalContext<C> & { context: IGlobalContext };
