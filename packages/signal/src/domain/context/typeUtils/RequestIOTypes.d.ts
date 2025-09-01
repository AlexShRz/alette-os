import { IRequestContext } from "../IRequestContext";
import { TMergeRecords } from "./TMergeRecords";

export type TRequestArguments<C extends IRequestContext> =
	C["accepts"] extends [] ? [] : C["accepts"][];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> = C["types"]["errorType"];

export type TExposedRequestContext<
	C extends IRequestContext = IRequestContext,
> = TMergeRecords<C["value"], C["settings"]>;
