import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { AbortedByMiddleware } from "./AbortedByMiddleware";

export class AbortedByMiddlewareFactory extends Middleware(
	"AbortedByMiddlewareFactory",
)(
	(getMiddleware: () => AbortedByMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[AbortedByMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
