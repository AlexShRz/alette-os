import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapTriggerMiddleware } from "./TapTriggerMiddleware";
import { TapTriggerMiddlewareFactory } from "./TapTriggerMiddlewareFactory";
import { tapTriggerMiddlewareSpecification } from "./tapTriggerMiddlewareSpecification";

export type TTapTriggerArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapTrigger<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapTriggerArgs,
	) => TapTrigger<_InContext>,
	InContext,
	[],
	typeof tapTriggerMiddlewareSpecification
> {
	protected middlewareSpec = tapTriggerMiddlewareSpecification;

	constructor(protected override lastArgs: TTapTriggerArgs = () => {}) {
		super((args) => new TapTrigger(args));
	}

	getMiddleware() {
		return new TapTriggerMiddlewareFactory(
			() => new TapTriggerMiddleware(this.lastArgs),
		);
	}
}

export const tapTrigger = new TapTrigger();
