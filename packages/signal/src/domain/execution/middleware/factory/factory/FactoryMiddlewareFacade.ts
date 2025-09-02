import { IRequestContext } from "../../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../../context/typeUtils/RequestIOTypes";
import { GlobalMiddlewarePriority } from "../../../../middleware/GlobalMiddlewarePriority";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../../middleware/toMiddlewareFactory";
import { FactoryMiddleware } from "../FactoryMiddleware";
import { factoryMiddlewareSpecification } from "../factoryMiddlewareSpecification";
import { FactoryMiddlewareFactory } from "./FactoryMiddlewareFactory";

type Spec = typeof factoryMiddlewareSpecification;

export interface IRequestRunner<C extends IRequestContext = IRequestContext> {
	(requestContext: TGetAllRequestContext<C>): Promise<unknown> | unknown;
}

export class FactoryMiddlewareFacade<
	Context extends IRequestContext,
> extends RequestMiddleware<Context, Spec> {
	constructor(runner: IRequestRunner<Context>) {
		super(() =>
			FactoryMiddlewareFactory.Default(
				() =>
					new RequestMiddleware(
						() => FactoryMiddleware.Default(runner as IRequestRunner),
						{
							priority: GlobalMiddlewarePriority.Execution,
						},
					),
			),
		);
	}

	static toFactory() {
		return <Context extends IRequestContext>(
			runner: IRequestRunner<Context>,
		) => {
			return toMiddlewareFactory<Context, Context, Spec>(
				() => new FactoryMiddlewareFacade(runner),
			);
		};
	}
}
