import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapMountMiddleware } from "./TapMountMiddleware";
import { TapMountMiddlewareFactory } from "./TapMountMiddlewareFactory";
import { tapMountMiddlewareSpecification } from "./tapMountMiddlewareSpecification";

export type TTapMountArgs = (
	context: TRequestGlobalContext,
) => void | Promise<void>;

export class TapMount<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapMountArgs,
	) => TapMount<_InContext>,
	InContext,
	[],
	typeof tapMountMiddlewareSpecification
> {
	protected middlewareSpec = tapMountMiddlewareSpecification;

	constructor(protected override lastArgs: TTapMountArgs = () => {}) {
		super((args) => new TapMount(args));
	}

	getMiddleware() {
		return new TapMountMiddlewareFactory(
			() => new TapMountMiddleware(this.lastArgs),
		);
	}
}

export const tapMount = /* @__PURE__ */ new TapMount();
