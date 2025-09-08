import { RunRequestEventEnvelope } from "./RunRequestEventEnvelope";

/**
 * Signals to "execution" middleware family
 * that they need to override currently running request
 * */
export class WithCurrentRequestOverride extends RunRequestEventEnvelope {
	clone() {
		return new WithCurrentRequestOverride(this.config.wrapped.clone()) as this;
	}
}
