import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestResponse } from "../../domain/context/typeUtils/RequestIOTypes";
import { IOneShotRequestState } from "../../domain/execution/state/IOneShotRequestState";

export interface ILocalOneShotRequestState<Context extends IRequestContext>
	extends Omit<IOneShotRequestState.Any<Context>, "data"> {
	data: TRequestResponse<Context> | null;
}
