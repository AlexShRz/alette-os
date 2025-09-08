import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithRunOnMountCheck } from "../../events/envelope/WithRunOnMountCheck";

export class RunOnMountMiddleware extends Middleware("RunOnMountMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(isEnabled = false) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof WithRunOnMountCheck)) {
								return yield* context.next(event);
							}

							if (!isEnabled) {
								return yield* E.zipRight(event.cancel(), context.next(event));
							}

							return yield* context.next(event.peel());
						});
					},
				};
			}),
) {}
