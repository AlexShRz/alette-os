import { RunRequestEventEnvelope } from "./RunRequestEventEnvelope";

/**
 * 1. Signals to "execution" middleware family
 * that they need to override currently running request
 * 2. Sent by the user.
 * */
export class WithCurrentRequestOverride extends RunRequestEventEnvelope {
	clone() {
		return new WithCurrentRequestOverride(this.config.wrapped.clone()) as this;
	}
}
