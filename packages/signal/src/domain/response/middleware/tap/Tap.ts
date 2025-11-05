import { IRequestContext } from "../../../context";
import {
	TFullRequestContext,
	TRequestResponse,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapMiddleware } from "./TapMiddleware";
import { TapMiddlewareFactory } from "./TapMiddlewareFactory";
import { tapMiddlewareSpecification } from "./tapMiddlewareSpecification";

export type TTapArgs<C extends IRequestContext = IRequestContext> = (
	response: TRequestResponse<C>,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class Tap<InContext extends IRequestContext> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapArgs<_InContext>,
	) => Tap<_InContext>,
	InContext,
	[],
	typeof tapMiddlewareSpecification
> {
	protected middlewareSpec = tapMiddlewareSpecification;

	constructor(protected override lastArgs: TTapArgs<InContext> = () => {}) {
		super((args) => new Tap(args));
	}

	getMiddleware() {
		return new TapMiddlewareFactory(
			() => new TapMiddleware(this.lastArgs as TTapArgs),
		);
	}
}

export const tap = new Tap();
