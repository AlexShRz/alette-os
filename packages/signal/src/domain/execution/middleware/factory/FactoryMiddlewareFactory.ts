import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { FactoryMiddleware } from "./FactoryMiddleware";
import { factoryMiddlewareSpecification } from "./factoryMiddlewareSpecification";

type Spec = typeof factoryMiddlewareSpecification;

export interface IRequestRunner<C extends IRequestContext = IRequestContext> {
	(requestContext: TGetAllRequestContext<C>): Promise<unknown> | unknown;
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
								event.addMiddleware(getMiddleware());
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
			return toMiddlewareFactory<Context, Context, Spec>(
				() => new FactoryMiddleware(runner as IRequestRunner),
			);
		};
	}
}
