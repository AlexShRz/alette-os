import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";

export class RequestWorker extends E.Service<RequestWorker>()("RequestWorker", {
	effect: E.fn(function* ({
		id,
	}: {
		id: string;
	}) {
		const scope = yield* Scope.make();

		return {
			getId() {
				return id;
			},

			shutdown() {
				return E.gen(function* () {
					yield* Scope.close(scope, Exit.void);
				});
			},
		};
	}),
}) {
	static makeAsValue(worker: Layer.Layer<RequestWorker>) {
		return Layer.build(worker).pipe(
			E.andThen((c) => Context.unsafeGet(c, RequestWorker)),
		);
	}
}
