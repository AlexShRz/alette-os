import { RequestAbortedError } from "@alette/pulse";
import * as E from "effect/Effect";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context/IRequestContext";
import { TAddDefaultRequestErrors } from "../../../errors/middleware/throws/RequestRecoverableErrors";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
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
		return <Context extends IRequestContext>(args: TAbortedByArgs) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TAddDefaultRequestErrors<Context, [Ctor<RequestAbortedError>]>,
					Context["value"],
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof abortedByMiddlewareSpecification
			>(
				() =>
					new AbortedByMiddlewareFactory(() => new AbortedByMiddleware(args)),
			);
		};
	}
}
