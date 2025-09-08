import { ISchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
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
		return <Context extends IRequestContext, ResponseValue>(
			schemaOrAdapter: TOutputMiddlewareArgs<ResponseValue>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeRecords<
						Context["types"],
						IOriginalRequestResponseValue<ResponseValue>
					>,
					Context["value"],
					Context["settings"],
					Context["accepts"]
				>,
				typeof outputMiddlewareSpecification
			>(() => new OutputMiddleware(schemaOrAdapter as TOutputMiddlewareArgs));
		};
	}
}
