import * as E from "effect/Effect";
import { IGlobalContext, IRequestContext } from "../../../context";
import {
	TGetRequestContextWithoutGlobalContext,
	TRequestSettings,
} from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ReloadableMiddleware } from "./ReloadableMiddleware";
import { reloadableMiddlewareSpecification } from "./reloadableMiddlewareSpecification";

export interface IReloadableMiddlewareCheck<
	C extends IRequestContext = IRequestContext,
> {
	(
		options: {
			prev: TGetRequestContextWithoutGlobalContext<C> | null;
			current: TRequestSettings<C>;
		},
		reqContext: { context: IGlobalContext },
	): boolean | Promise<boolean>;
}

export class ReloadableMiddlewareFactory extends Middleware(
	"ReloadableMiddlewareFactory",
)(
	(getMiddleware: () => ReloadableMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[ReloadableMiddleware],
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
			predicate?: IReloadableMiddlewareCheck<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof reloadableMiddlewareSpecification,
				IReloadableMiddlewareCheck<InContext> | undefined
			>({
				name: "reloadable",
				lastArgs: predicate,
				middlewareSpec: reloadableMiddlewareSpecification,
				middlewareFactory: (predicate) =>
					new ReloadableMiddlewareFactory(
						() =>
							new ReloadableMiddleware(
								predicate as IReloadableMiddlewareCheck | undefined,
							),
					),
			});
		};
	}
}
