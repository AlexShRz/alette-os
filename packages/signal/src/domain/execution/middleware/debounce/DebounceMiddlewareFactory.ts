import * as E from "effect/Effect";
import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ThrottleMiddleware } from "../throttle/ThrottleMiddleware";
import { DebounceMiddleware } from "./DebounceMiddleware";
import { IDebounceSettings } from "./DebounceSettings";
import { debounceMiddlewareSpecification } from "./debounceMiddlewareSpecification";

export type TDebounceMiddlewareDurationSupplier =
	| ((
			options: TRequestGlobalContext,
	  ) => TRecognizedApiDuration | Promise<TRecognizedApiDuration>)
	| TRecognizedApiDuration;

export class DebounceMiddlewareFactory extends Middleware(
	"DebounceMiddlewareFactory",
)(
	(getMiddleware: () => DebounceMiddleware) =>
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
			args: TDebounceMiddlewareDurationSupplier = 300,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof debounceMiddlewareSpecification,
				TDebounceMiddlewareDurationSupplier,
				[
					IRequestContextPatch<{
						acceptsMounted: IDebounceSettings;
					}>,
				]
			>({
				name: "debounce",
				lastArgs: args,
				middlewareSpec: debounceMiddlewareSpecification,
				middlewareFactory: (args) =>
					new DebounceMiddlewareFactory(() => new DebounceMiddleware(args)),
			});
		};
	}
}
