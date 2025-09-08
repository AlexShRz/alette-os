import { IGlobalContext } from "../IGlobalContext";
import { IRequestContext } from "../IRequestContext";
import { TMergeRecords } from "./TMergeRecords";

export type TRequestArguments<C extends IRequestContext> =
	C["accepts"] extends [] ? [] : C["accepts"][];

export type TRequestArgumentsAsRecord<C extends IRequestContext> =
	TRequestArguments<C>[number];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> = C["types"]["errorType"];

export type TGetRequestContextWithoutGlobalContext<
	C extends IRequestContext = IRequestContext,
> = TMergeRecords<C["value"], C["settings"]>;

export type TGetAllRequestContext<C extends IRequestContext = IRequestContext> =
	TGetRequestContextWithoutGlobalContext<C> & { context: IGlobalContext };
