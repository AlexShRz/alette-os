import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TMountedRequestArguments } from "../../../domain/context/typeUtils/RequestIOTypes";
import { TSessionEvent } from "../../../domain/execution/events/SessionEvent";
import { WithCurrentRequestOverride } from "../../../domain/execution/events/envelope/WithCurrentRequestOverride";
import { WithReloadableCheck } from "../../../domain/execution/events/envelope/WithReloadableCheck";
import { WithRunOnMountCheck } from "../../../domain/execution/events/envelope/WithRunOnMountCheck";
import { CancelRequest } from "../../../domain/execution/events/request/CancelRequest";
import { RunRequest } from "../../../domain/execution/events/request/RunRequest";
import { RequestController } from "../../blueprint/controller/RequestController";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { PrepareRequestWorkerArguments } from "../workflows/prepareRequestWorker/PrepareRequestWorkerArguments";
import {
	ILocalOneShotRequestState,
	OneShotRequestState,
} from "./OneShotRequestState";
import { OneShotRequestWorker } from "./OneShotRequestWorker";

export class OneShotRequestController<
	Context extends IRequestContext = IRequestContext,
	State extends
		ILocalOneShotRequestState<Context> = ILocalOneShotRequestState<Context>,
> extends RequestController<Context, State> {
	/**
	 * 1. The moment we sent our first runOnMount check to
	 * the system, we need to set this to true.
	 * 2. We do not care whether the request was cancelled or not.
	 * */
	protected wasMounted = false;
	protected wasUnmounted = false;

	protected state = new OneShotRequestState<Context, State>(this.plugin);
	protected worker: OneShotRequestWorker;

	constructor(
		plugin: ApiPlugin,
		workerConfig: Omit<
			PrepareRequestWorkerArguments["Type"],
			"getController" | "workerId" | "pluginName"
		>,
	) {
		super(plugin);
		this.worker = new OneShotRequestWorker(this.plugin, {
			...workerConfig,
			getController: () => this as RequestController,
		});
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
	getStateManager() {
		return this.state;
	}

	subscribe(...params: Parameters<(typeof this.state)["subscribe"]>) {
		return this.state.subscribe(...params);
	}

	protected dispatch<T extends TSessionEvent>(event: T) {
		if (this.wasUnmounted) {
			return;
		}

		this.plugin.getScheduler().schedule(this.worker.dispatch(event));
	}

	protected executeRequest(
		settings: TMountedRequestArguments<Context> = {} as TMountedRequestArguments<Context>,
	) {
		if (!this.wasMounted) {
			this.wasMounted = true;
		}

		this.dispatch(
			new WithCurrentRequestOverride(
				new RunRequest(this.getSettingSupplier(settings)),
			).setRequestId(),
		);
	}

	protected configureMountModeEvent(event: RunRequest) {
		if (!this.wasMounted) {
			this.wasMounted = true;
			return new WithRunOnMountCheck(event).setRequestId();
		}

		return new WithReloadableCheck(event).setRequestId();
	}

	protected cancelRequest() {
		this.dispatch(new CancelRequest());
	}

	reload() {
		this.dispatch(
			this.configureMountModeEvent(new RunRequest(this.getSettingSupplier())),
		);
	}

	dispose() {
		this.wasUnmounted = true;
		this.worker.shutdown();
	}
}
