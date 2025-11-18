import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { RunOnMountMiddleware } from "./RunOnMountMiddleware";

export class RunOnMountMiddlewareFactory extends Middleware(
	"RunOnMountMiddlewareFactory",
)(
	(getMiddleware: () => RunOnMountMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[RunOnMountMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
