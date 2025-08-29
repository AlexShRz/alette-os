import { IRequestContext } from "./IRequestContext";

export type TRequestArguments<C extends IRequestContext> =
	C["accepts"] extends [] ? [] : C["accepts"][];

export type TRequestResponse<C extends IRequestContext> =
	C["types"]["resultType"];

export type TRequestError<C extends IRequestContext> = C["types"]["errorType"];
