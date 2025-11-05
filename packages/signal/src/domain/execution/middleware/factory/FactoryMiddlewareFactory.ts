import * as E from "effect/Effect";
import { ThrowsMiddleware } from "../../../errors/middleware/throws/ThrowsMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { FactoryMiddleware } from "./FactoryMiddleware";

export class FactoryMiddlewareFactory extends Middleware(
	"FactoryMiddlewareFactory",
)(
	(getMiddleware: () => FactoryMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof AggregateRequestMiddleware)) {
								return yield* context.next(event);
							}

							const hasThrowsMiddleware = event
								.getMiddleware()
								.some((middleware) => middleware instanceof ThrowsMiddleware);

							const injectedMiddleware = hasThrowsMiddleware
								? [getMiddleware()]
								: [getMiddleware(), new ThrowsMiddleware([])];

							event.replaceMiddleware([FactoryMiddleware], injectedMiddleware);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
