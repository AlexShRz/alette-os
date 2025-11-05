import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapAbortMiddleware } from "./TapAbortMiddleware";
import { TapAbortMiddlewareFactory } from "./TapAbortMiddlewareFactory";
import { tapAbortMiddlewareSpecification } from "./tapAbortMiddlewareSpecification";

export type TTapAbortArgs<C extends IRequestContext = IRequestContext> = (
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapAbort<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapAbortArgs<_InContext>,
	) => TapAbort<_InContext>,
	InContext,
	[],
	typeof tapAbortMiddlewareSpecification
> {
	protected middlewareSpec = tapAbortMiddlewareSpecification;

	constructor(protected override lastArgs: TTapAbortArgs<any> = () => {}) {
		super((args) => new TapAbort(args));
	}

	getMiddleware() {
		return new TapAbortMiddlewareFactory(
			() => new TapAbortMiddleware(this.lastArgs),
		);
	}
}

export const tapAbort = new TapAbort();
