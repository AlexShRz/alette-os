import * as E from "effect/Effect";
import { IGlobalContext } from "../../../context";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TGetRequestContextWithoutGlobalContext,
	TRequestArgumentsAsRecord,
} from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ReloadableMiddleware } from "./ReloadableMiddleware";
import { reloadableMiddlewareSpecification } from "./reloadableMiddlewareSpecification";

export interface IReloadableMiddlewareCheck<
	C extends IRequestContext = IRequestContext,
> {
	(
		options: {
			prev: TGetRequestContextWithoutGlobalContext<C> | null;
			current: TRequestArgumentsAsRecord<C>;
		},
		reqContext: { context: IGlobalContext },
	): boolean;
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
		return <Context extends IRequestContext>(
			predicate?: IReloadableMiddlewareCheck<Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof reloadableMiddlewareSpecification
			>(
				() =>
					new ReloadableMiddleware(
						predicate as IReloadableMiddlewareCheck | undefined,
					),
			);
		};
	}
}
