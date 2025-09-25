import { IGlobalContext } from "../IGlobalContext";
import { IRequestContext } from "../IRequestContext";
import { TMergeRecords } from "./TMergeRecords";

export type TRequestArguments<C extends IRequestContext> = C["accepts"];

export type TMountedRequestArguments<C extends IRequestContext> =
	C["acceptsMounted"];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> = C["types"]["errorType"];

export type TRequestContextAdapter<C extends IRequestContext> =
	C["types"]["contextAdapter"];

export type TGetRequestContextWithoutGlobalContext<
	C extends IRequestContext = IRequestContext,
> = TMergeRecords<C["value"], C["settings"]>;

export type TRequestGlobalContext = { context: IGlobalContext };

export type TGetAllRequestContext<C extends IRequestContext = IRequestContext> =
	TGetRequestContextWithoutGlobalContext<C> & TRequestGlobalContext;
