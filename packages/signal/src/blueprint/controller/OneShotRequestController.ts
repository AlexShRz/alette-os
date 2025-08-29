import * as E from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import { IRequestContext } from "../../context/IRequestContext";
import {
	TRequestArguments,
	TRequestError,
	TRequestResponse,
} from "../../context/RequestIOTypes";
import { RequestInterruptedException } from "../../exception/RequestInterruptedException";
import {
	IOneShotRequestState,
	OneShotRequestControllerLifecycle,
} from "./OneShotRequestControllerLifecycle";
import { RequestController } from "./RequestController";

export interface IOneShotRequestStateWithHandlers<
	Context extends IRequestContext,
> extends IOneShotRequestState<Context> {
	execute: (...args: TRequestArguments<Context>) => void;
	cancel: () => void;
}

export class OneShotRequestController<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestController<IOneShotRequestStateWithHandlers<Context>, R, ER> {
	protected lifecycle = new OneShotRequestControllerLifecycle<Context, R, ER>(
		this.runtime,
	);

	constructor(runtime: ManagedRuntime.ManagedRuntime<R, ER>) {
		super(runtime);
		this.lifecycle.spawnAndSupervise(
			this.lifecycle.takeStateChanges().pipe(
				Stream.tap((state) =>
					E.sync(() => {
						this.stateSubscribers.forEach((subscriber) => {
							subscriber({
								...state,
								cancel: this.cancelRequest.bind(this),
								execute: this.executeRequest.bind(this),
							});
						});
					}),
				),
				Stream.runDrain,
				E.forkScoped,
			),
		);
	}

	getInitialState(): IOneShotRequestStateWithHandlers<Context> {
		return {
			...this.lifecycle.getInitialStateSnapshot(),
			cancel: this.cancelRequest.bind(this),
			execute: this.executeRequest.bind(this),
		};
	}

	getScope() {
		return this.lifecycle.getScope();
	}

	getEventReceiver() {
		return this.lifecycle.getEventReceiver();
	}

	protected cancelRequest() {}

	protected executeRequest(...args: TRequestArguments<Context>) {}

	run() {}

	dispose() {}

	awaitResult() {
		const fiber = this.lifecycle.spawnAndSupervise(this.waitForResult());
		return this.runtime.runPromise(Fiber.join(fiber));
	}

	protected waitForResult() {
		return E.async<TRequestResponse<Context>, TRequestError<Context>>(
			(resume) => {
				this.lifecycle.spawnAndSupervise(
					E.gen(this, function* () {
						yield* E.addFinalizer(() =>
							E.sync(() => {
								resume(new RequestInterruptedException());
							}),
						);

						yield* this.lifecycle.takeStateChanges().pipe(
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
	}
}
