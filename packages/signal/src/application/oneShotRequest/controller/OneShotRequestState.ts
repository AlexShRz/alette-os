import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import {
	TRequestError,
	TRequestResponse,
} from "../../../domain/context/typeUtils/RequestIOTypes";
import { CancelRequest } from "../../../domain/execution/events/CancelRequest";
import { InterruptRequest } from "../../../domain/execution/events/InterruptRequest";
import { RequestFailed } from "../../../domain/execution/events/request/RequestFailed";
import { RequestLoading } from "../../../domain/execution/events/request/RequestLoading";
import { RequestSucceeded } from "../../../domain/execution/events/request/RequestSuccedded";
import { RequestInterruptedException } from "../../../shared/exception/RequestInterruptedException";
import { RequestControllerState } from "../../blueprint/controller/RequestControllerState";
import { OneShotRequestLifecycle } from "./OneShotRequestLifecycle";

export interface IOneShotRequestState<Context extends IRequestContext> {
	isLoading: boolean;
	isUninitialized: boolean;
	isSuccess: boolean;
	isError: boolean;
	data: Context["types"]["resultType"] | null;
	error: Context["types"]["errorType"] | RequestInterruptedException | null;
}

export class OneShotRequestState<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestControllerState<IOneShotRequestState<Context>, R, ER> {
	constructor(
		runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected lifecycle: OneShotRequestLifecycle<R, ER>,
	) {
		super(runtime);
		this.startStateSync();
	}

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

	protected startStateSync() {
		const task = Stream.fromQueue(this.getStateEventReceiver()).pipe(
			Stream.tap((e) => this.applyEvent(e)),
			Stream.runDrain,
			E.forkScoped,
		);

		return this.lifecycle.spawnAndSupervise(task);
	}

	protected applyEvent(event: BusEvent) {
		return SubscriptionRef.getAndUpdate(this.state, (state) => {
			const defaultState = state ?? this.getInitialStateSnapshot();

			/**
			 * 1. Do not change "data" or "error" props here.
			 * 2. This approach allows for "stale-while-revalidate"
			 * pattern to be applied.
			 * */
			if (event instanceof RequestLoading) {
				return {
					...defaultState,
					isLoading: true,
					isUninitialized: false,
				};
			}

			if (event instanceof RequestSucceeded) {
				return {
					...defaultState,
					isLoading: false,
					isError: false,
					isSuccess: true,
					isUninitialized: false,
					data: event.getSuccessValue(),
					error: null,
				};
			}

			if (event instanceof RequestFailed) {
				return {
					...defaultState,
					isLoading: false,
					isSuccess: false,
					isUninitialized: false,
					isError: true,
					data: null,
					error: event.getError(),
				};
			}

			if (event instanceof InterruptRequest) {
				return {
					...defaultState,
					isLoading: false,
					isSuccess: false,
					isUninitialized: false,
					isError: true,
					data: null,
					error: new RequestInterruptedException(),
				};
			}

			/**
			 * 1. Reset the "loading" prop, but that's it.
			 * 2. Success/Failure state must be preserved.
			 * */
			if (event instanceof CancelRequest) {
				return {
					...defaultState,
					isLoading: false,
					isUninitialized: false,
				};
			}

			return state;
		});
	}

	awaitResult() {
		const task = E.async<TRequestResponse<Context>, TRequestError<Context>>(
			(resume) => {
				this.lifecycle.spawnAndSupervise(
					E.gen(this, function* () {
						yield* E.addFinalizer(() =>
							E.sync(() => {
								resume(new RequestInterruptedException());
							}),
						);

						yield* this.changes().pipe(
							Stream.tap(({ data, error, isError, isSuccess }) =>
								E.sync(() => {
									if (isError && error) {
										return resume(error as any);
									}

									if (isSuccess && data) {
										return resume(data as any);
									}
								}),
							),
							Stream.runDrain,
							E.forkScoped,
						);
					}),
				);

				return E.sync(() => {
					resume(new RequestInterruptedException());
				});
			},
		);

		return this.runtime.runPromise(
			Fiber.join(this.lifecycle.spawnAndSupervise(task)),
		);
	}
}
