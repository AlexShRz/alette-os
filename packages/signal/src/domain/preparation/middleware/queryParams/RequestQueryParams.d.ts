import { IQueryParams } from "@alette/pulse";
import { IRequestContext } from "../../../context/IRequestContext";

export interface IRequestQueryParams<
	Params extends IQueryParams = IQueryParams,
> {
	queryParams: Params;
}

export type TGetRequestQueryParams<
	Context extends IRequestContext,
	Params = Context["value"]["queryParams"],
> = Params extends IQueryParams ? Params : {};
