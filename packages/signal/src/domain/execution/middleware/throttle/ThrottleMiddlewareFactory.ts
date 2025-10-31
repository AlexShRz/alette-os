import * as E from "effect/Effect";
import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { DebounceMiddleware } from "../debounce/DebounceMiddleware";
import { TDebounceMiddlewareDurationSupplier } from "../debounce/DebounceMiddlewareFactory";
import { ThrottleMiddleware } from "./ThrottleMiddleware";
import { IThrottleSettings } from "./ThrottleSettings";
import { throttleMiddlewareSpecification } from "./throttleMiddlewareSpecification";

export type TThrottleMiddlewareDurationSupplier =
	| ((
			options: TRequestGlobalContext,
	  ) => TRecognizedApiDuration | Promise<TRecognizedApiDuration>)
	| TRecognizedApiDuration;

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
) {
	static toFactory() {
		return <InContext extends IRequestContext>(
			durationSupplier: TThrottleMiddlewareDurationSupplier = 500,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof throttleMiddlewareSpecification,
				TDebounceMiddlewareDurationSupplier,
				[
					IRequestContextPatch<{
						acceptsMounted: IThrottleSettings;
					}>,
				]
			>({
				name: "throttle",
				lastArgs: durationSupplier,
				middlewareSpec: throttleMiddlewareSpecification,
				middlewareFactory: (args) =>
					new ThrottleMiddlewareFactory(() => new ThrottleMiddleware(args)),
			});
		};
	}
}
