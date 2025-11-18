import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { QueryParamsMiddleware } from "./QueryParamsMiddleware";

export class QueryParamsMiddlewareFactory extends Middleware(
	"QueryParamsMiddlewareFactory",
)(
	(getMiddleware: () => QueryParamsMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.addMiddleware(getMiddleware());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
