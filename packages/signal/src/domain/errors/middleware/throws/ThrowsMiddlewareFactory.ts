import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import {
	IRecognizedRequestError,
	TAddDefaultRequestErrors,
} from "./RequestRecoverableErrors";
import { ThrowsMiddleware } from "./ThrowsMiddleware";
import { throwsMiddlewareSpecification } from "./throwsMiddlewareSpecification";

export class ThrowsMiddlewareFactory extends Middleware(
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
			RecoverableErrors extends IRecognizedRequestError[],
		>(
			...errors: [...RecoverableErrors]
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TAddDefaultRequestErrors<Context, RecoverableErrors>,
					Context["value"],
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof throwsMiddlewareSpecification
			>(() => new ThrowsMiddlewareFactory(() => new ThrowsMiddleware(errors)));
		};
	}
}
