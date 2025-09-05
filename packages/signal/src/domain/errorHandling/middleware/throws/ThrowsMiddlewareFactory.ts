import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { AggregateRequestMiddleware } from "../../../execution/events/AggregateRequestMiddleware";
import { RequestMiddleware } from "../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import {
	IRecoverableApiError,
	TAddDefaultRequestErrors,
} from "./RequestRecoverableErrors";
import { ThrowsMiddleware } from "./ThrowsMiddleware";
import { throwsMiddlewareSpecification } from "./throwsMiddlewareSpecification";

type Spec = typeof throwsMiddlewareSpecification;

export class ThrowsMiddlewareFactory extends RequestMiddleware.as(
	"ThrowsMiddlewareFactory",
)(
	(getMiddleware: () => ThrowsMiddleware) =>
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
		return <
			Context extends IRequestContext,
			RecoverableErrors extends IRecoverableApiError[],
		>(
			...errors: [...RecoverableErrors]
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TAddDefaultRequestErrors<Context, RecoverableErrors>,
					Context["value"],
					Context["meta"],
					Context["settings"],
					Context["accepts"]
				>,
				Spec
			>(() => new ThrowsMiddleware(errors));
		};
	}
}
