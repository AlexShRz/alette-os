import { RequestInterruptedError } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { ApplyRequestState } from "../../events/request/ApplyRequestState";
import { RequestState } from "../../events/request/RequestState";
import { IOneShotRequestState } from "../../state/IOneShotRequestState";

export const toNextOneShotRequestState = <T extends ApplyRequestState | null>({
	lastEvent,
	event,
}: {
	lastEvent: T;
	event: ApplyRequestState;
}) => {
	if (!(event instanceof ApplyRequestState)) {
		return lastEvent;
	}

	const defaultState: IOneShotRequestState.Any = {
		...(lastEvent?.getState() || {
			isLoading: false,
			isSuccess: false,
			isError: false,
			isUninitialized: true,
			data: null,
			error: null,
			settings: null,
		}),
	};

	/**
	 * 1. Do not change "data" or "error" props here.
	 * 2. This approach allows for "stale-while-revalidate"
	 * pattern to be applied.
	 * */
	if (RequestState.isLoading(event)) {
		return new ApplyRequestState<IRequestContext, IOneShotRequestState.Loading>(
			{
				...defaultState,
				isLoading: true,
				isUninitialized: false,
			},
		);
	}

	if (RequestState.isInterrupted(event)) {
		return new ApplyRequestState<
			IRequestContext,
			IOneShotRequestState.Interrupted
		>({
			...defaultState,
			isLoading: false,
			isSuccess: false,
			isUninitialized: false,
			isError: true,
			data: null,
			error: new RequestInterruptedError(),
		});
	}

	if (RequestState.isUninitialized(event)) {
		return new ApplyRequestState<
			IRequestContext,
			IOneShotRequestState.Uninitialized
		>({
			...defaultState,
			isLoading: false,
			isError: false,
			isSuccess: true,
			isUninitialized: true,
			data: null,
			error: null,
		});
	}

	if (RequestState.isSuccess(event)) {
		const { data, settings } = event.getState();

		return new ApplyRequestState<IRequestContext, IOneShotRequestState.Success>(
			{
				...defaultState,
				isLoading: false,
				isError: false,
				isSuccess: true,
				isUninitialized: false,
				data: data!,
				error: null,
				settings,
			},
		);
	}

	if (RequestState.isFailure(event)) {
		const { settings } = event.getState();

		return new ApplyRequestState<IRequestContext, IOneShotRequestState.Failure>(
			{
				...defaultState,
				isLoading: false,
				isSuccess: false,
				isUninitialized: false,
				isError: true,
				data: null,
				error: event.getError(),
				settings,
			},
		);
	}

	/**
	 * Cancelled
	 * 1. Reset the "loading" prop, but that's it.
	 * 2. Success/Failure state must be preserved.
	 * */
	return new ApplyRequestState<IRequestContext, IOneShotRequestState.Cancelled>(
		{
			...defaultState,
			isLoading: false,
			isUninitialized: false,
		},
	);
};
