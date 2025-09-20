import { UrlBuilder } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { OneShotRequestNotification } from "../../../lifecycle/notifications/OneShotRequestNotification";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { TGetRequestQueryParams } from "../../../preparation/middleware/queryParams/RequestQueryParams";
import { TGetOriginalRequestResponseValue } from "../../../response/middleware/output/OriginalResponseValue";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { FactoryMiddleware } from "./FactoryMiddleware";
import { factoryMiddlewareSpecification } from "./factoryMiddlewareSpecification";

export interface IRequestRunner<C extends IRequestContext = IRequestContext> {
	(
		requestContext: TGetAllRequestContext<C> & {
			url: UrlBuilder<TGetRequestQueryParams<C>>;
		},
		utils: { notify: (notification: OneShotRequestNotification) => void },
	):
		| Promise<TGetOriginalRequestResponseValue<C>>
		| TGetOriginalRequestResponseValue<C>;
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
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([FactoryMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext>(
			runner: IRequestRunner<Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof factoryMiddlewareSpecification
			>(
				() => new FactoryMiddlewareFactory(() => new FactoryMiddleware(runner)),
			);
		};
	}
}
