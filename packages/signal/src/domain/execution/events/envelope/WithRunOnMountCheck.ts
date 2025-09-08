import { RunRequestEventEnvelope } from "./RunRequestEventEnvelope";

export class WithRunOnMountCheck extends RunRequestEventEnvelope {
	clone() {
		return new WithRunOnMountCheck(this.config.wrapped.clone()) as this;
	}
}
