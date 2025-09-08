import { ApiException, type } from "@alette/pulse";
import { RequestInterruptedException } from "../../../../shared/exception/RequestInterruptedException";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TRequestError,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { responseAdapter } from "../../../response";
import { ResponseRef } from "../../../response/adapter/ResponseRef";
import { IOneShotRequestState } from "../../state/IOneShotRequestState";
import { ApplyRequestState } from "./ApplyRequestState";

export class RequestState {
	static isLoading<C extends IRequestContext = IRequestContext>(
		event: ApplyRequestState<C>,
	): event is ApplyRequestState<C, IOneShotRequestState.Loading> {
		return event.getState().isLoading;
	}

	static isSuccess<C extends IRequestContext = IRequestContext>(
		event: ApplyRequestState<C>,
	): event is ApplyRequestState<C, IOneShotRequestState.Success<C>> {
		return (event.getState() as IOneShotRequestState.Any<C>).isSuccess;
	}

	static isFailure<C extends IRequestContext = IRequestContext>(
		event: ApplyRequestState<C>,
	): event is ApplyRequestState<C, IOneShotRequestState.Failure<C>> {
		const state: IOneShotRequestState.Any<C> = event.getState();
		return state.isError && state.error instanceof ApiException;
	}

	static isUninitialized<C extends IRequestContext = IRequestContext>(
		event: ApplyRequestState<C>,
	): event is ApplyRequestState<C, IOneShotRequestState.Uninitialized> {
		return (event.getState() as IOneShotRequestState.Any<C>).isUninitialized;
	}

	static isInterrupted<C extends IRequestContext = IRequestContext>(
		event: ApplyRequestState<C>,
	): event is ApplyRequestState<C, IOneShotRequestState.Interrupted> {
		const state: IOneShotRequestState.Any<C> = event.getState();
		return state.isError && state.error instanceof RequestInterruptedException;
	}

	static Uninitialized() {
		return new ApplyRequestState<any, IOneShotRequestState.Uninitialized>({
			isLoading: true,
			isSuccess: false,
			isUninitialized: true,
			isError: false,
			data: null,
			error: null,
		});
	}

	static Loading() {
		return new ApplyRequestState<any, IOneShotRequestState.Loading>({
			isLoading: true,
			isSuccess: false,
			isUninitialized: false,
			isError: false,
			data: null,
			error: null,
		});
	}

	static Succeeded<C extends IRequestContext>(
		value: ResponseRef<TRequestResponse<C>> | TRequestResponse<C>,
	) {
		const defaultAdapter =
			value instanceof ResponseRef
				? value
				: responseAdapter()
						.schema(type<TRequestResponse<C>>())
						.build()
						.from(value);

		return new ApplyRequestState<C, IOneShotRequestState.Success<C>>({
			isLoading: false,
			isSuccess: true,
			isUninitialized: false,
			isError: false,
			data: defaultAdapter,
			error: null,
		});
	}

	static Failed<C extends IRequestContext>(error: TRequestError<C>) {
		return new ApplyRequestState<C, IOneShotRequestState.Failure<C>>({
			isLoading: false,
			isSuccess: false,
			isUninitialized: false,
			isError: true,
			data: null,
			error,
		});
	}

	static Interrupted() {
		return new ApplyRequestState<any, IOneShotRequestState.Interrupted>({
			isLoading: false,
			isSuccess: false,
			isUninitialized: false,
			isError: true,
			data: null,
			error: new RequestInterruptedException(),
		});
	}

	static Cancelled() {
		return new ApplyRequestState<any>({
			isLoading: false,
			isSuccess: false,
			isUninitialized: false,
			isError: false,
			data: null,
			error: null,
		} satisfies IOneShotRequestState.Cancelled);
	}
}
