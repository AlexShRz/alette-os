import { ApiError } from "@alette/pulse";
import { IRequestContext } from "../../../context/IRequestContext";
import { IOneShotRequestState } from "../../state/IOneShotRequestState";
import { RequestSessionEvent } from "../RequestSessionEvent";

export class ApplyRequestState<
	C extends IRequestContext = IRequestContext,
	State extends IOneShotRequestState.Any<C> = any,
> extends RequestSessionEvent {
	constructor(protected state: State) {
		super();
	}

	getUnwrappedState() {
		return {
			...this.state,
			/**
			 * Make sure we return "null" here if we have no state
			 * adapter set
			 * */
			data: this.state.data?.unsafeGet() ?? null,
		} satisfies State;
	}

	getState() {
		return this.state;
	}

	getResult() {
		return this.state.data?.unsafeGet() ?? null;
	}

	getError() {
		return this.state.error;
	}

	async update<NewState extends IOneShotRequestState.Any<C>>(
		provider: (prevState: typeof this.state) => NewState | Promise<NewState>,
	): Promise<ApplyRequestState<C, NewState>> {
		const updater = async () => await provider(this.state);
		this.state = (await updater()) as any;
		return this as any;
	}

	protected _clone() {
		const state = this.getState();
		const self = new ApplyRequestState<C, State>({
			...state,
			data: state.data?.clone() ?? null,
			error: (state.error as ApiError | null)?.clone() ?? null,
		});
		return self as this;
	}
}
