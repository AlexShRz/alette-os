import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapCancelMiddleware } from "./TapCancelMiddleware";
import { TapCancelMiddlewareFactory } from "./TapCancelMiddlewareFactory";
import { tapCancelMiddlewareSpecification } from "./tapCancelMiddlewareSpecification";

export type TTapCancelArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapCancel<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapCancelArgs<_InContext>,
	) => TapCancel<_InContext>,
	InContext,
	[],
	typeof tapCancelMiddlewareSpecification
> {
	protected middlewareSpec = tapCancelMiddlewareSpecification;

	constructor(protected override lastArgs: TTapCancelArgs<any> = () => {}) {
		super((args) => new TapCancel(args));
	}

	getMiddleware() {
		return new TapCancelMiddlewareFactory(
			() => new TapCancelMiddleware(this.lastArgs),
		);
	}
}

export const tapCancel = /* @__PURE__ */ new TapCancel();
