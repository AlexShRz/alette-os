import * as E from "effect/Effect";
import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context/IRequestContext";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
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
									[DebounceMiddleware],
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
			durationSupplier: TDebounceMiddlewareDurationSupplier,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					Context["settings"],
					Context["accepts"],
					TMergeRecords<Context["acceptsMounted"], IDebounceSettings>
				>,
				typeof debounceMiddlewareSpecification
			>(
				() =>
					new DebounceMiddlewareFactory(
						() => new DebounceMiddleware(durationSupplier),
					),
			);
		};
	}
}
