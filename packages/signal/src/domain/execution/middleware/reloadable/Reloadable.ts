import { IGlobalContext, IRequestContext } from "../../../context";
import {
	TGetRequestContextWithoutGlobalContext,
	TRequestSettings,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { ReloadableMiddleware } from "./ReloadableMiddleware";
import { ReloadableMiddlewareFactory } from "./ReloadableMiddlewareFactory";
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

export class Reloadable<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args?: IReloadableMiddlewareCheck<_InContext>,
	) => Reloadable<_InContext>,
	InContext,
	[],
	typeof reloadableMiddlewareSpecification
> {
	protected middlewareSpec = reloadableMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| IReloadableMiddlewareCheck<InContext>
			| undefined = undefined,
	) {
		super((args) => new Reloadable(args));
	}

	getMiddleware() {
		return new ReloadableMiddlewareFactory(
			() =>
				new ReloadableMiddleware(this.lastArgs as IReloadableMiddlewareCheck),
		);
	}
}

export const reloadable = new Reloadable();
