import { BusEvent } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { Middleware } from "../../../domain/middleware/Middleware";
import { TActivityLensMiddlewareArgs } from "./ActivityLens";

export const getLensActivityMiddleware = (
	interceptor: TActivityLensMiddlewareArgs,
	priority: number,
) => {
	class ActivityLensMiddleware extends Middleware("ActivityLensMiddleware", {
		priority,
		canReceiveCancelled: true,
		canReceiveCompleted: true,
	})(
		() =>
			({ parent, context }) =>
				E.gen(function* () {
					const configuredInterceptor = async (event: BusEvent) =>
						await interceptor(event);
					const runInterceptor = (event: BusEvent) =>
						E.promise(() => configuredInterceptor(event));

					return {
						...parent,
						send(event) {
							return E.gen(this, function* () {
								yield* runInterceptor(event);
								return yield* context.next(event);
							});
						},
					};
				}),
	) {}

	return new ActivityLensMiddleware();
};
