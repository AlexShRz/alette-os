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
		this.state = plugin
			.getScheduler()
			.getOwnRuntime()
			.runSync(
				SubscriptionRef.make({
					isLoading: false,
					isUninitialized: true,
					isSuccess: false,
					isError: false,
					data: null,
					error: null,
				} as State),
			);
	}

	getState() {
		return this.plugin.getScheduler().getOwnRuntime().runSync(this.state.get);
	}

	applyStateSnapshot(event: ApplyRequestState<Context>) {
		return SubscriptionRef.getAndUpdate(this.state, (state) => {
			if (!(event instanceof ApplyRequestState)) {
				return state;
			}

			const newState = event.getUnwrappedState() as State;

			/**
			 * Skip default state broadcasting
			 * */
			if (!newState.isUninitialized) {
				this.stateSubscribers.forEach((subscriber) => {
					subscriber({
						...newState,
					});
				});
			}

			return newState;
		});
	}
}
