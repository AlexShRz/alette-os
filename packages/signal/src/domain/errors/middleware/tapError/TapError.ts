import { IRequestContext } from "../../../context";
import {
	TFullRequestContext,
	TRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapErrorMiddleware } from "./TapErrorMiddleware";
import { TapErrorMiddlewareFactory } from "./TapErrorMiddlewareFactory";
import { tapErrorMiddlewareSpecification } from "./tapErrorMiddlewareSpecification";

export type TTapErrorArgs<C extends IRequestContext = IRequestContext> = (
	error: TRequestError<C>,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapError<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapErrorArgs<_InContext>,
	) => TapError<_InContext>,
	InContext,
	[],
	typeof tapErrorMiddlewareSpecification
> {
	protected middlewareSpec = tapErrorMiddlewareSpecification;

	constructor(protected override lastArgs: TTapErrorArgs<any> = () => {}) {
		super((args) => new TapError(args));
	}

	getMiddleware() {
		return new TapErrorMiddlewareFactory(
			() => new TapErrorMiddleware(this.lastArgs),
		);
	}
}

export const tapError = new TapError();
