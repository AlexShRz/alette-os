import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../domain/execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../domain/middleware/Middleware";
import { getLensActivityMiddleware } from "./getLensActivityMiddleware";

export class ActivityLensMiddlewareFactory extends Middleware(
	"ActivityLensMiddlewareFactory",
)(
	(getMiddleware: () => ReturnType<typeof getLensActivityMiddleware>) =>
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
