import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { DebounceMiddleware } from "../debounce/DebounceMiddleware";
import { ThrottleMiddleware } from "./ThrottleMiddleware";

export class ThrottleMiddlewareFactory extends Middleware(
	"ThrottleMiddlewareFactory",
)(
	(getMiddleware: () => ThrottleMiddleware) =>
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
