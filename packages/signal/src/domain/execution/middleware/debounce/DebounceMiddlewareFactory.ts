import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ThrottleMiddleware } from "../throttle/ThrottleMiddleware";
import { DebounceMiddleware } from "./DebounceMiddleware";

export class DebounceMiddlewareFactory extends Middleware(
	"DebounceMiddlewareFactory",
)(
	(getMiddleware: () => DebounceMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[ThrottleMiddleware, DebounceMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
