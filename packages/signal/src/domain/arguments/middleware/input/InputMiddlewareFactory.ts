import { ISchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { IRequestArguments } from "../../RequestArguments";
import { InputMiddleware } from "./InputMiddleware";
import { inputMiddlewareSpecification } from "./inputMiddlewareSpecification";

type Spec = typeof inputMiddlewareSpecification;

export interface IInputMiddlewareArgSchema<Output = unknown>
	extends ISchema<unknown, Output> {}

export type InputMiddlewareArgProvider<Value = unknown> =
	| (() => Value)
	| undefined;

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
								event.addMiddleware(getMiddleware());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext, ArgType>(
			argSchema: IInputMiddlewareArgSchema<ArgType>,
			argSupplier?: InputMiddlewareArgProvider<ArgType>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					Context["meta"],
					TMergeRecords<Context["settings"], IRequestArguments<ArgType>>,
					TMergeRecords<Context["accepts"], IRequestArguments<ArgType>>
				>,
				Spec
			>(() => new InputMiddleware(argSchema, argSupplier));
		};
	}
}
