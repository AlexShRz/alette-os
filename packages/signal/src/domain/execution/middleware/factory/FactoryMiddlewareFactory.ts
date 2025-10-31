import { UrlBuilder } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { ThrowsMiddleware } from "../../../errors/middleware/throws/ThrowsMiddleware";
import { OneShotRequestNotification } from "../../../lifecycle/notifications/OneShotRequestNotification";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TGetRequestQueryParams } from "../../../preparation/middleware/queryParams/RequestQueryParams";
import { TGetOriginalRequestResponseValue } from "../../../response/middleware/output/OriginalResponseValue";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { FactoryMiddleware } from "./FactoryMiddleware";
import { factoryMiddlewareSpecification } from "./factoryMiddlewareSpecification";

export interface IRequestRunner<C extends IRequestContext = IRequestContext> {
	(
		requestContext: TFullRequestContext<C> & {
			url: UrlBuilder<TGetRequestQueryParams<C>>;
		},
		utils: {
			notify: (notification: OneShotRequestNotification) => void;
			signal: AbortSignal;
		},
	):
		| Promise<TGetOriginalRequestResponseValue<C>>
		| TGetOriginalRequestResponseValue<C>
		| Promise<unknown>
		| unknown;
}

export class FactoryMiddlewareFactory extends Middleware(
	"FactoryMiddlewareFactory",
)(
	(getMiddleware: () => FactoryMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof AggregateRequestMiddleware)) {
								return yield* context.next(event);
							}

							const hasThrowsMiddleware = event
								.getMiddleware()
								.some((middleware) => middleware instanceof ThrowsMiddleware);

							const injectedMiddleware = hasThrowsMiddleware
								? [getMiddleware()]
								: [getMiddleware(), new ThrowsMiddleware([])];

							event.replaceMiddleware([FactoryMiddleware], injectedMiddleware);

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext>(
			runner: IRequestRunner<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof factoryMiddlewareSpecification,
				IRequestRunner<InContext>
			>({
				name: "factory",
				lastArgs: runner,
				middlewareSpec: factoryMiddlewareSpecification,
				middlewareFactory: (runner) =>
					new FactoryMiddlewareFactory(() => new FactoryMiddleware(runner)),
			});
		};
	}
}
