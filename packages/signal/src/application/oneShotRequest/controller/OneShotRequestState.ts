import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { TRequestResponse } from "../../../domain/context/typeUtils/RequestIOTypes";
import { ApplyRequestState } from "../../../domain/execution/events/request/ApplyRequestState";
import { IOneShotRequestState } from "../../../domain/execution/state/IOneShotRequestState";
import { RequestControllerState } from "../../blueprint/controller/RequestControllerState";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export interface ILocalOneShotRequestState<Context extends IRequestContext>
	extends Omit<IOneShotRequestState.Any<Context>, "data"> {
	data: TRequestResponse<Context> | null;
}

export class OneShotRequestState<
	Context extends IRequestContext,
	State extends ILocalOneShotRequestState<Context>,
> extends RequestControllerState<State> {
	protected state: SubscriptionRef.SubscriptionRef<State>;

	constructor(plugin: ApiPlugin) {
		super(plugin);
		this.state = plugin.getScheduler().runSync(
			SubscriptionRef.make({
				isLoading: false,
				isUninitialized: true,
				isSuccess: false,
				isError: false,
				data: null,
				error: null,
			} as State),
		);
		this.startStateSync();
	}

	getState() {
		return this.plugin.getScheduler().runSync(this.state.get);
	}

	protected startStateSync() {
		const task = Stream.fromQueue(this.getStateEventReceiver()).pipe(
			Stream.tap((e) => this.applyEvent(e)),
			Stream.runDrain,
			E.forkScoped,
		);

		return this.plugin.getScheduler().schedule(task);
	}

	protected applyEvent(event: BusEvent) {
		return SubscriptionRef.getAndUpdate(this.state, (state) => {
			if (!(event instanceof ApplyRequestState)) {
				return state;
			}

			return (event as ApplyRequestState<Context>).getUnwrappedState();
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
}
