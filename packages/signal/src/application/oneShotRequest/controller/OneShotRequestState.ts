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
import { ApplyRequestState } from "../../../domain/execution/events/request/ApplyRequestState";
import { IOneShotRequestState } from "../../../domain/execution/state/IOneShotRequestState";
import { RequestInterruptedException } from "../../../shared/exception/RequestInterruptedException";
import { RequestControllerState } from "../../blueprint/controller/RequestControllerState";
import { OneShotRequestSupervisor } from "./OneShotRequestSupervisor";

export interface ILocalOneShotRequestState<Context extends IRequestContext>
	extends Omit<IOneShotRequestState.Any<Context>, "data"> {
	data: TRequestResponse<Context> | null;
}

export class OneShotRequestState<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestControllerState<ILocalOneShotRequestState<Context>, R, ER> {
	protected state: SubscriptionRef.SubscriptionRef<
		ILocalOneShotRequestState<Context>
	>;

	constructor(
		runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected supervisor: OneShotRequestSupervisor<R, ER>,
	) {
		super(runtime);
		this.state = runtime.runSync(
			SubscriptionRef.make({
				isLoading: false,
				isUninitialized: true,
				isSuccess: false,
				isError: false,
				data: null,
				error: null,
			} as ILocalOneShotRequestState<Context>),
		);
		this.startStateSync();
	}

	getState() {
		return this.runtime.runSync(this.state.get);
	}

	protected startStateSync() {
		const task = Stream.fromQueue(this.getStateEventReceiver()).pipe(
			Stream.tap((e) => this.applyEvent(e)),
			Stream.runDrain,
			E.forkScoped,
		);

		return this.supervisor.spawnAndSupervise(task);
	}

	protected applyEvent(event: BusEvent) {
		return SubscriptionRef.getAndUpdate(this.state, (state) => {
			if (!(event instanceof ApplyRequestState)) {
				return state;
			}

			const { data, ...updatedState } = (
				event as ApplyRequestState<Context>
			).getState();

			return {
				...updatedState,
				data: data?.unsafeGet(),
			};
		});
	}

	changes() {
		return this.state.changes.pipe(
			/**
			 * Skip default state broadcasting
			 * */
			Stream.filter(({ isUninitialized }) => !isUninitialized),
		);
	}

	awaitResult() {
		const task = E.async<TRequestResponse<Context>, TRequestError<Context>>(
			(resume) => {
				this.supervisor.spawnAndSupervise(
					E.gen(this, function* () {
						yield* E.addFinalizer(() =>
							E.sync(() => {
								resume(E.fail(new RequestInterruptedException()));
							}),
						);

						yield* this.changes().pipe(
							Stream.tap(
								({ data, error, isUninitialized, isError, isSuccess }) =>
									E.sync(() => {
										if (isError && error) {
											return resume(E.fail(error));
										}

										if (isSuccess && data) {
											return resume(E.succeed(data));
										}
									}),
							),
							Stream.runDrain,
							E.forkScoped,
						);
					}),
				);

				return E.sync(() => {
					resume(E.fail(new RequestInterruptedException()));
				});
			},
		);

		return this.runtime.runPromise(
			Fiber.join(this.supervisor.spawnAndSupervise(task)),
		);
	}
}
