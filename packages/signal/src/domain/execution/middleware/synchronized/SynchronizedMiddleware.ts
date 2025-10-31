import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";

export class SynchronizedMiddleware extends Middleware(
	"SynchronizedMiddleware",
	{
		priority: MiddlewarePriority.BeforeExecution,
	},
)(
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
