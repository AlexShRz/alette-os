import { ISchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { ResponseAdapter } from "../../adapter/ResponseAdapter";
import { IOriginalRequestResponseValue } from "./OriginalResponseValue";
import { OutputMiddleware } from "./OutputMiddleware";
import { outputMiddlewareSpecification } from "./outputMiddlewareSpecification";

export type TOutputMiddlewareArgs<Value = unknown> =
	| ISchema<unknown, Value>
	| ResponseAdapter<Value>;

export class OutputMiddlewareFactory extends Middleware(
	"OutputMiddlewareFactory",
)(
	(getMiddleware: () => OutputMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([OutputMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext, ResponseValue>(
			schemaOrAdapter: TOutputMiddlewareArgs<ResponseValue>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof outputMiddlewareSpecification,
				TOutputMiddlewareArgs<ResponseValue>,
				[
					IRequestContextPatch<{
						types: IOriginalRequestResponseValue<ResponseValue>;
					}>,
				]
			>({
				name: "output",
				lastArgs: schemaOrAdapter,
				middlewareSpec: outputMiddlewareSpecification,
				middlewareFactory: (args) =>
					new OutputMiddlewareFactory(
						() => new OutputMiddleware(args as TOutputMiddlewareArgs),
					),
			});
		};
	}
}
