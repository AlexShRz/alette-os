import * as E from "effect/Effect";
import { RequestExecutor } from "./executor/RequestExecutor";

export class PendingRequest {
	protected piped: E.Effect<unknown>[] = [];
	protected requestExecutor = this.getRequestExecutor();

	protected getRequestExecutor() {
		return E.gen(function* () {
			const runner = yield* RequestExecutor;
			return yield* runner.run();
		});
	}

	prependOperation<A, E, R>(task: E.Effect<A, E, R>) {
		this.piped.push(task as E.Effect<unknown, never, never>);
		return this;
	}

	unwrap() {
		return E.all([...this.piped]).pipe(E.andThen(() => this.requestExecutor));
	}
}
