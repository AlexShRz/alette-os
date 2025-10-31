import * as E from "effect/Effect";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TBodySupplier } from "./BodyMiddlewareFactory";
import { updateBody } from "./utils/updateBody";

export class BodyMiddleware extends Middleware("BodyMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(bodySupplier: TBodySupplier) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							return yield* context.next(
								event.executeLazy((operation) =>
									operation.pipe(E.andThen(() => updateBody(bodySupplier))),
								),
							);
						});
					},
				};
			}),
) {}
