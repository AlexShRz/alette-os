import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TGetRequestOrigin } from "../origin/RequestOrigin";
import { TGetRequestPath } from "../path/RequestPath";
import { TGetRequestQueryParams } from "../queryParams/RequestQueryParams";
import { UrlMiddleware } from "./UrlMiddleware";
import { urlMiddlewareSpecification } from "./urlMiddlewareSpecification";

export interface IUrlMiddlewareCollectedUrlProps<
	C extends IRequestContext = IRequestContext,
> {
	origin: TGetRequestOrigin<C>;
	path: TGetRequestPath<C>;
	queryParams: TGetRequestQueryParams<C>;
}

export type TUrlMiddlewareArgs<C extends IRequestContext = IRequestContext> =
	| ((
			collectedUrlProps: IUrlMiddlewareCollectedUrlProps<C>,
			context: TFullRequestContext<C>,
	  ) => string)
	| string;

export class UrlMiddlewareFactory extends Middleware("UrlMiddlewareFactory")(
	(getMiddleware: () => UrlMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([UrlMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <InContext extends IRequestContext>(
			args: TUrlMiddlewareArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof urlMiddlewareSpecification,
				TUrlMiddlewareArgs<InContext>
			>({
				name: "url",
				lastArgs: args,
				middlewareSpec: urlMiddlewareSpecification,
				middlewareFactory: (args) =>
					new UrlMiddlewareFactory(
						() => new UrlMiddleware(args as TUrlMiddlewareArgs),
					),
			});
		};
	}
}
