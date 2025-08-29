import { IRequestContext } from "../../context/IRequestContext";
import { RequestControllerLifecycle } from "./RequestControllerLifecycle";

export interface IOneShotRequestState<Context extends IRequestContext> {
	isLoading: boolean;
	isUninitialized: boolean;
	isSuccess: boolean;
	isError: boolean;
	data: Context["types"]["resultType"] | null;
	error: Context["types"]["errorType"] | null;
}

export class OneShotRequestControllerLifecycle<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestControllerLifecycle<IOneShotRequestState<Context>, R, ER> {
	getInitialStateSnapshot(): IOneShotRequestState<Context> {
		return {
			isLoading: false,
			isUninitialized: false,
			isSuccess: false,
			isError: false,
			data: null,
			error: null,
		};
	}
}
