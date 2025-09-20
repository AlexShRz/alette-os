import * as E from "effect/Effect";
import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { DebounceMiddleware } from "../debounce/DebounceMiddleware";
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
		return <Context extends IRequestContext>(
			durationSupplier: TThrottleMiddlewareDurationSupplier,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					Context["settings"],
					Context["accepts"],
					TMergeRecords<Context["acceptsMounted"], IThrottleSettings>
				>,
				typeof throttleMiddlewareSpecification
			>(
				() =>
					new ThrottleMiddlewareFactory(
						() => new ThrottleMiddleware(durationSupplier),
					),
			);
		};
	}
}
