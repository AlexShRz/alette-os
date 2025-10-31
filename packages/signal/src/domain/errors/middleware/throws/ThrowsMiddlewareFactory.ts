import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
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
			InContext extends IRequestContext,
			RecoverableErrors extends IRecognizedRequestError[],
		>(
			...errors: [...RecoverableErrors]
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof throwsMiddlewareSpecification,
				[...RecoverableErrors],
				[TAddDefaultRequestErrors<InContext, RecoverableErrors>]
			>({
				name: "throws",
				lastArgs: errors,
				middlewareSpec: throwsMiddlewareSpecification,
				middlewareFactory: (args) =>
					new ThrowsMiddlewareFactory(() => new ThrowsMiddleware(args)),
			});
		};
	}
}
