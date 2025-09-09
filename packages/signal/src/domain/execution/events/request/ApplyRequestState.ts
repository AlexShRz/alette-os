import { ApiException } from "@alette/pulse";
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

	getState() {
		return this.state;
	}

	getResult() {
		return this.state.data?.unsafeGet() ?? null;
	}

	getError() {
		return this.state.error;
	}

	update<NewState extends IOneShotRequestState.Any<C>>(
		provider: (prevState: typeof this.state) => NewState,
	): ApplyRequestState<C, NewState> {
		this.state = provider(this.state) as any;
		return this as any;
	}

	protected _clone() {
		const self = new ApplyRequestState<C, State>({
			...this.state,
			data: this.state.data?.clone() || null,
			error: (this.state.error as ApiException | null)?.clone() || null,
		});
		return self as this;
	}
}
