import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";

export class SharedMiddleware extends Middleware("SharedMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	() =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							return yield* context.next(event);
						});
					},
				};
			}),
) {}
