import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TGetRecognizedRequestErrors } from "../throws/RequestRecoverableErrors";
import { RetryWhenMiddleware } from "./RetryWhenMiddleware";
import { retryWhenMiddlewareSpecification } from "./retryWhenMiddlewareSpecification";

export interface IRetryMiddlewareArgs<
	C extends IRequestContext = IRequestContext,
> {
	(
		errorContext: {
			error: TGetRecognizedRequestErrors<C>;
			attempt: number;
		},
		requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext>(
			args: IRetryMiddlewareArgs<Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof retryWhenMiddlewareSpecification
			>(
				() =>
					new RetryWhenMiddlewareFactory(
						() => new RetryWhenMiddleware(args as IRetryMiddlewareArgs),
					),
			);
		};
	}
}
