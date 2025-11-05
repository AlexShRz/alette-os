import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { BearerMiddleware } from "./BearerMiddleware";

export class BearerMiddlewareFactory extends Middleware(
	"BearerMiddlewareFactory",
)(
	(getMiddleware: () => BearerMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([BearerMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
