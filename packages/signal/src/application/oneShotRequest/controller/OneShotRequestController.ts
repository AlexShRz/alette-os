import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestArguments } from "../../../domain/context/typeUtils/RequestIOTypes";
import { CancelRequest } from "../../../domain/execution/events/CancelRequest";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { WithCurrentRequestOverride } from "../../../domain/execution/events/envelope/WithCurrentRequestOverride";
import { WithRunOnMountCheck } from "../../../domain/execution/events/envelope/WithRunOnMountCheck";
import { RunRequest } from "../../../domain/execution/events/request/RunRequest";
import { RequestController } from "../../blueprint/controller/RequestController";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { PrepareRequestWorkerArguments } from "../workflows/prepareRequestWorker/PrepareRequestWorkerArguments";
import {
	ILocalOneShotRequestState,
	OneShotRequestState,
} from "./OneShotRequestState";
import { OneShotRequestSupervisor } from "./OneShotRequestSupervisor";
import { OneShotRequestWorker } from "./OneShotRequestWorker";

export class OneShotRequestController<
	Context extends IRequestContext,
> extends RequestController<Context, ILocalOneShotRequestState<Context>> {
	protected supervisor = new OneShotRequestSupervisor(this.plugin);
	protected state = new OneShotRequestState<Context>(
		this.plugin,
		this.supervisor,
	);
	protected worker: OneShotRequestWorker;

	constructor(
		plugin: ApiPlugin,
		workerConfig: Omit<
			PrepareRequestWorkerArguments["Type"],
			"controller" | "workerId" | "pluginName"
		>,
	) {
		super(plugin);
		this.worker = new OneShotRequestWorker(this.plugin, this.supervisor, {
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
						});
					});
				}),
			),
			Stream.runDrain,
			E.forkScoped,
		);

		this.supervisor.spawnAndSupervise(task);
	}

	getHandlers() {
		return {
			unmount: this.dispose.bind(this),
			cancel: this.cancelRequest.bind(this),
			execute: this.executeRequest.bind(this),
		};
	}

	getState() {
		return this.state.getState();
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

	protected executeRequest(
		settings: TRequestArguments<Context> = {} as TRequestArguments<Context>,
	) {
		this.dispatch(
			new WithCurrentRequestOverride(
				new RunRequest(this.getSettingSupplier(settings)),
			).setRequestId(),
		);
	}

	reload() {
		this.dispatch(
			new WithRunOnMountCheck(
				new RunRequest(this.getSettingSupplier()),
			).setRequestId(),
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
