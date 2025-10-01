import * as E from "effect/Effect";
import { RequestRunner } from "./runner/RequestRunner";

export class PendingRequest {
	protected requestExecutor = this.getRequestExecutor();

	protected getRequestExecutor() {
		return E.gen(function* () {
			const runner = yield* RequestRunner;
			return yield* runner.run();
		});
	}

	prependOperation<A, E, R>(task: E.Effect<A, E, R>) {
		this.requestExecutor = task.pipe(
			E.andThen(() => this.requestExecutor),
		) as E.Effect<unknown, never, never>;
		return this;
	}

	unwrap() {
		return this.requestExecutor;
	}
}
