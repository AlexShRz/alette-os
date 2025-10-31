import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../domain/context/IRequestContext";
import { AggregateRequestMiddleware } from "../../../domain/execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../domain/middleware/Middleware";
import { MiddlewareFacade } from "../../../domain/middleware/facade/MiddlewareFacade";
import { activityLensMiddlewareSpecification } from "./activityLensMiddlewareSpecification";
import { getLensActivityMiddleware } from "./getLensActivityMiddleware";

export type TActivityLensMiddlewareArgs = (
	interceptedEvent: BusEvent,
) => void | Promise<void>;

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
) {
	static toFactory() {
		return <InContext extends IRequestContext>(
			args: TActivityLensMiddlewareArgs,
			priority = 0,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof activityLensMiddlewareSpecification,
				TActivityLensMiddlewareArgs
			>({
				name: "tapCancel",
				lastArgs: args,
				middlewareSpec: activityLensMiddlewareSpecification,
				middlewareFactory: (args) =>
					new ActivityLensMiddlewareFactory(() =>
						getLensActivityMiddleware(args, priority),
					),
			});
		};
	}
}
