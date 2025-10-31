import { ISchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { IRequestArguments } from "../../context/arguments/RequestArguments";
import { ArgumentAdapter } from "../../context/arguments/adapter/ArgumentAdapter";
import { InputMiddleware } from "./InputMiddleware";
import { inputMiddlewareSpecification } from "./inputMiddlewareSpecification";

export type TInputMiddlewareArgValue<Arguments = unknown> =
	| ISchema<unknown, Arguments>
	| ArgumentAdapter<Arguments>;

export class InputMiddlewareFactory extends Middleware(
	"InputMiddlewareFactory",
)(
	(getMiddleware: () => InputMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([InputMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext, ArgType>(
			argSchemaOrAdapter: TInputMiddlewareArgValue<ArgType>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof inputMiddlewareSpecification,
				TInputMiddlewareArgValue<ArgType>,
				[
					IRequestContextPatch<{
						value: IRequestArguments<ArgType>;
						accepts: IRequestArguments<ArgType>;
						acceptsMounted: IRequestArguments<ArgType>;
					}>,
				]
			>({
				name: "input",
				lastArgs: argSchemaOrAdapter,
				middlewareSpec: inputMiddlewareSpecification,
				middlewareFactory: (args) =>
					new InputMiddlewareFactory(
						() => new InputMiddleware(args as TInputMiddlewareArgValue),
					),
			});
		};
	}
}
