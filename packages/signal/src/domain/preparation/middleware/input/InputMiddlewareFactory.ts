import { ISchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
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
		return <Context extends IRequestContext, ArgType>(
			argSchemaOrAdapter: TInputMiddlewareArgValue<ArgType>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					TMergeRecords<Context["settings"], IRequestArguments<ArgType>>,
					TMergeRecords<Context["accepts"], IRequestArguments<ArgType>>,
					TMergeRecords<Context["acceptsMounted"], IRequestArguments<ArgType>>
				>,
				typeof inputMiddlewareSpecification
			>(
				() =>
					new InputMiddlewareFactory(
						() =>
							new InputMiddleware(
								argSchemaOrAdapter as TInputMiddlewareArgValue,
							),
					),
			);
		};
	}
}
