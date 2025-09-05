import * as E from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestArguments } from "../../../domain/context/typeUtils/RequestIOTypes";
import { CancelRequest } from "../../../domain/execution/events/CancelRequest";
import { RequestSessionEvent } from "../../../domain/execution/events/RequestSessionEvent";
import { RunRequest } from "../../../domain/execution/events/request/RunRequest";
import { IRequestSessionSettingSupplier } from "../../../domain/execution/services/RequestSessionContext";
import { RequestController } from "../../blueprint/controller/RequestController";
import { PrepareRequestWorker } from "../../workflows/PrepareRequestWorker";
import { OneShotRequestLifecycle } from "./OneShotRequestLifecycle";
import {
	IOneShotRequestState,
	OneShotRequestState,
} from "./OneShotRequestState";
import { OneShotRequestWorker } from "./OneShotRequestWorker";

export interface IOneShotRequestStateWithHandlers<
	Context extends IRequestContext,
> extends IOneShotRequestState<Context> {
	execute: (...args: TRequestArguments<Context> | []) => void;
	cancel: () => void;
}

export class OneShotRequestController<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestController<IOneShotRequestStateWithHandlers<Context>, R, ER> {
	protected lifecycle = new OneShotRequestLifecycle<R, ER>(this.runtime);
	protected state = new OneShotRequestState<Context, R, ER>(
		this.runtime,
		this.lifecycle,
	);
	protected worker: OneShotRequestWorker<R, ER>;

	constructor(
		runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		workerConfig: Omit<
			Parameters<typeof PrepareRequestWorker.make>[number],
			"controller"
		>,
	) {
		super(runtime);
		this.worker = new OneShotRequestWorker(this.runtime, this.lifecycle, {
			...workerConfig,
			// TODO: Fix any
			controller: this as any,
		});

		const task = this.state.changes().pipe(
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
		);

		this.lifecycle.spawnAndSupervise(task);
	}

	getInitialState(): IOneShotRequestStateWithHandlers<Context> {
		return {
			...this.state.getInitialStateSnapshot(),
			cancel: this.cancelRequest.bind(this),
			execute: this.executeRequest.bind(this),
		};
	}

	/** @internal */
	getScope() {
		return this.lifecycle.getScope();
	}

	/** @internal */
	getEventReceiver() {
		return this.state.getStateEventReceiver();
	}

	protected dispatch<T extends RequestSessionEvent>(event: T) {
		this.lifecycle.spawnAndSupervise(this.worker.dispatch(event));
	}

	protected cancelRequest() {
		this.dispatch(new CancelRequest());
	}

	protected executeRequest(...args: TRequestArguments<Context>) {
		const supplier = !args.length ? this.getSettingSupplier() : () => args;
		this.dispatch(new RunRequest(supplier as IRequestSessionSettingSupplier));
	}

	run() {
		this.dispatch(new RunRequest(this.getSettingSupplier()));
	}

	dispose() {
		this.lifecycle.shutdown();
	}

	/** @internal */
	awaitResult() {
		return this.state.awaitResult();
	}
}
