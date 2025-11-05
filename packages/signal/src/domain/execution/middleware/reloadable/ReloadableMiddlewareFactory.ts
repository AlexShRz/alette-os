import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ReloadableMiddleware } from "./ReloadableMiddleware";

export class ReloadableMiddlewareFactory extends Middleware(
	"ReloadableMiddlewareFactory",
)(
	(getMiddleware: () => ReloadableMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[ReloadableMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
