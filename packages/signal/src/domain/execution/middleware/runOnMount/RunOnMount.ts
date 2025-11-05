import { IRequestContext } from "../../../context";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { RunOnMountMiddleware } from "./RunOnMountMiddleware";
import { RunOnMountMiddlewareFactory } from "./RunOnMountMiddlewareFactory";
import { runOnMountMiddlewareSpecification } from "./runOnMountMiddlewareSpecification";

export type TRunOnMountMiddlewareArgs =
	| boolean
	| ((requestContext: TRequestGlobalContext) => Promise<boolean> | boolean);

export class RunOnMount<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args?: TRunOnMountMiddlewareArgs,
	) => RunOnMount<_InContext>,
	InContext,
	[],
	typeof runOnMountMiddlewareSpecification
> {
	protected middlewareSpec = runOnMountMiddlewareSpecification;

	constructor(protected override lastArgs: TRunOnMountMiddlewareArgs = true) {
		super((args) => new RunOnMount(args));
	}

	getMiddleware() {
		return new RunOnMountMiddlewareFactory(
			() => new RunOnMountMiddleware(this.lastArgs),
		);
	}
}

export const runOnMount = new RunOnMount();
