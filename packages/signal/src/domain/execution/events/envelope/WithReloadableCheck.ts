import { RunRequestEventEnvelope } from "./RunRequestEventEnvelope";

export class WithReloadableCheck extends RunRequestEventEnvelope {
	clone() {
		return new WithReloadableCheck(this.config.wrapped.clone()) as this;
	}
}
