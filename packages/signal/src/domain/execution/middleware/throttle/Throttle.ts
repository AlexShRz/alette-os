import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { ThrottleMiddleware } from "./ThrottleMiddleware";
import { ThrottleMiddlewareFactory } from "./ThrottleMiddlewareFactory";
import { IThrottleSettings } from "./ThrottleSettings";
import { throttleMiddlewareSpecification } from "./throttleMiddlewareSpecification";

export type TThrottleMiddlewareDurationSupplier =
	| ((
			options: TRequestGlobalContext,
	  ) => TRecognizedApiDuration | Promise<TRecognizedApiDuration>)
	| TRecognizedApiDuration;

export class Throttle<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args?: TThrottleMiddlewareDurationSupplier,
	) => Throttle<_InContext>,
	InContext,
	[
		IRequestContextPatch<{
			acceptsMounted: IThrottleSettings;
		}>,
	],
	typeof throttleMiddlewareSpecification
> {
	protected middlewareSpec = throttleMiddlewareSpecification;

	constructor(
		protected override lastArgs: TThrottleMiddlewareDurationSupplier = 500,
	) {
		super((args) => new Throttle(args));
	}

	getMiddleware() {
		return new ThrottleMiddlewareFactory(
			() => new ThrottleMiddleware(this.lastArgs),
		);
	}
}

export const throttle = new Throttle();
