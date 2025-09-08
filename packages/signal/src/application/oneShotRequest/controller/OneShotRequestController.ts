import * as E from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestArguments } from "../../../domain/context/typeUtils/RequestIOTypes";
import { CancelRequest } from "../../../domain/execution/events/CancelRequest";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { WithCurrentRequestOverride } from "../../../domain/execution/events/envelope/WithCurrentRequestOverride";
import { WithReloadableCheck } from "../../../domain/execution/events/envelope/WithReloadableCheck";
import { WithRunOnMountCheck } from "../../../domain/execution/events/envelope/WithRunOnMountCheck";
import { RunRequest } from "../../../domain/execution/events/request/RunRequest";
import { IRequestSessionSettingSupplier } from "../../../domain/execution/services/RequestSessionContext";
import { RequestController } from "../../blueprint/controller/RequestController";
import { PrepareRequestWorker } from "../workflows/PrepareRequestWorker";
import {
	ILocalOneShotRequestState,
	OneShotRequestState,
} from "./OneShotRequestState";
import { OneShotRequestSupervisor } from "./OneShotRequestSupervisor";
import { OneShotRequestWorker } from "./OneShotRequestWorker";

export interface IOneShotRequestStateWithHandlers<
	Context extends IRequestContext,
> extends ILocalOneShotRequestState<Context> {
	execute: (...args: TRequestArguments<Context> | []) => void;
	cancel: () => void;
}

export class OneShotRequestController<
	Context extends IRequestContext,
	R,
	ER,
> extends RequestController<IOneShotRequestStateWithHandlers<Context>, R, ER> {
	protected supervisor = new OneShotRequestSupervisor<R, ER>(this.runtime);
	protected state = new OneShotRequestState<Context, R, ER>(
		this.runtime,
		this.supervisor,
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
		this.worker = new OneShotRequestWorker(this.runtime, this.supervisor, {
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

		this.supervisor.spawnAndSupervise(task);
	}

	getInitialState(): IOneShotRequestStateWithHandlers<Context> {
		return {
			...this.state.getState(),
			cancel: this.cancelRequest.bind(this),
			execute: this.executeRequest.bind(this),
		};
	}

	/** @internal */
	getScope() {
		return this.supervisor.getScope();
	}

	/** @internal */
	getEventReceiver() {
		return this.state.getStateEventReceiver();
	}

	protected dispatch<T extends TSessionEvent>(event: T) {
		this.supervisor.spawnAndSupervise(this.worker.dispatch(event));
	}

	protected cancelRequest() {
		this.dispatch(new CancelRequest());
	}

	protected executeRequest(...args: TRequestArguments<Context>) {
		const providedSupplier = this.getSettingSupplier();
		const supplier =
			!args.length && providedSupplier ? providedSupplier : () => args;
		this.dispatch(
			new WithCurrentRequestOverride(
				new RunRequest(supplier as IRequestSessionSettingSupplier),
			),
		);
	}

	run() {
		this.dispatch(
			new WithRunOnMountCheck(
				new WithReloadableCheck(new RunRequest(this.getSettingSupplier())),
			),
		);
	}

	dispose() {
		this.supervisor.shutdown();
	}

	/** @internal */
	awaitResult() {
		return this.state.awaitResult();
	}
}
