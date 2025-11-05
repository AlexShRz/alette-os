import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapUnmountMiddleware } from "./TapUnmountMiddleware";
import { TapUnmountMiddlewareFactory } from "./TapUnmountMiddlewareFactory";
import { tapUnmountMiddlewareSpecification } from "./tapUnmountMiddlewareSpecification";

export type TTapUnmountArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapUnmount<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapUnmountArgs,
	) => TapUnmount<_InContext>,
	InContext,
	[],
	typeof tapUnmountMiddlewareSpecification
> {
	protected middlewareSpec = tapUnmountMiddlewareSpecification;

	constructor(protected override lastArgs: TTapUnmountArgs = () => {}) {
		super((args) => new TapUnmount(args));
	}

	getMiddleware() {
		return new TapUnmountMiddlewareFactory(
			() => new TapUnmountMiddleware(this.lastArgs),
		);
	}
}

export const tapUnmount = new TapUnmount();
