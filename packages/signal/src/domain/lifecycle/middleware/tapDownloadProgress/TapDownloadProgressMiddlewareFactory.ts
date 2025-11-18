import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { TapDownloadProgressMiddleware } from "./TapDownloadProgressMiddleware";

export class TapDownloadProgressMiddlewareFactory extends Middleware(
	"TapDownloadProgressMiddlewareFactory",
)(
	(getMiddleware: () => TapDownloadProgressMiddleware) =>
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
