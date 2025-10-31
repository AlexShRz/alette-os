import { RequestAbortedError } from "@alette/pulse";
import * as E from "effect/Effect";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context/IRequestContext";
import { TAddDefaultRequestErrors } from "../../../errors/middleware/throws/RequestRecoverableErrors";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { AbortedByMiddleware } from "./AbortedByMiddleware";
import { abortedByMiddlewareSpecification } from "./abortedByMiddlewareSpecification";

export type TAbortedByArgs = AbortController | AbortSignal;

export class AbortedByMiddlewareFactory extends Middleware(
	"AbortedByMiddlewareFactory",
)(
	(getMiddleware: () => AbortedByMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[AbortedByMiddleware],
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
		return <InContext extends IRequestContext>(args: TAbortedByArgs) => {
			return new MiddlewareFacade<
				InContext,
				typeof abortedByMiddlewareSpecification,
				TAbortedByArgs,
				[TAddDefaultRequestErrors<InContext, [Ctor<RequestAbortedError>]>]
			>({
				name: "abortedBy",
				lastArgs: args,
				middlewareSpec: abortedByMiddlewareSpecification,
				middlewareFactory: (args) =>
					new AbortedByMiddlewareFactory(() => new AbortedByMiddleware(args)),
			});
		};
	}
}
