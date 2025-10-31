import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TOriginalRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { IRetrySettings } from "../RetrySettings";
import { RetryWhenMiddleware } from "./RetryWhenMiddleware";
import { retryWhenMiddlewareSpecification } from "./retryWhenMiddlewareSpecification";

export interface IRetryWhenMiddlewareArgs<
	C extends IRequestContext = IRequestContext,
> {
	(
		errorContext: {
			error: TOriginalRequestError<C>;
			attempt: number;
		},
		requestContext: TFullRequestContext<C>,
	): boolean | Promise<boolean>;
}

export class RetryWhenMiddlewareFactory extends Middleware(
	"RetryWhenMiddlewareFactory",
)(
	(getMiddleware: () => RetryWhenMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[RetryWhenMiddleware],
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
		return <InContext extends IRequestContext>(
			args: IRetryWhenMiddlewareArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof retryWhenMiddlewareSpecification,
				IRetryWhenMiddlewareArgs<InContext>,
				[
					IRequestContextPatch<{
						accepts: IRetrySettings;
						acceptsMounted: IRetrySettings;
					}>,
				]
			>({
				name: "retryWhen",
				lastArgs: args,
				middlewareSpec: retryWhenMiddlewareSpecification,
				middlewareFactory: (args) =>
					new RetryWhenMiddlewareFactory(
						() => new RetryWhenMiddleware(args as IRetryWhenMiddlewareArgs),
					),
			});
		};
	}
}
