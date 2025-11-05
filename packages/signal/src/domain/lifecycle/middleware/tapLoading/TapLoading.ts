import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapLoadingMiddleware } from "./TapLoadingMiddleware";
import { TapLoadingMiddlewareFactory } from "./TapLoadingMiddlewareFactory";
import { tapLoadingMiddlewareSpecification } from "./tapLoadingMiddlewareSpecification";

export type TTapLoadingArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapLoading<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapLoadingArgs<_InContext>,
	) => TapLoading<_InContext>,
	InContext,
	[],
	typeof tapLoadingMiddlewareSpecification
> {
	protected middlewareSpec = tapLoadingMiddlewareSpecification;

	constructor(protected override lastArgs: TTapLoadingArgs<any> = () => {}) {
		super((args) => new TapLoading(args));
	}

	getMiddleware() {
		return new TapLoadingMiddlewareFactory(
			() => new TapLoadingMiddleware(this.lastArgs),
		);
	}
}

export const tapLoading = new TapLoading();
