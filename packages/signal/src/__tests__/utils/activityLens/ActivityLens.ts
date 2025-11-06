import { BusEvent } from "@alette/event-sourcing";
import { IRequestContext } from "../../../domain";
import { MiddlewareFacade } from "../../../domain/middleware/MiddlewareFacade";
import { ActivityLensMiddlewareFactory } from "./ActivityLensMiddlewareFactory";
import { activityLensMiddlewareSpecification } from "./activityLensMiddlewareSpecification";
import { getLensActivityMiddleware } from "./getLensActivityMiddleware";

export type TActivityLensMiddlewareArgs = (
	interceptedEvent: BusEvent,
) => void | Promise<void>;

export class ActivityLens<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		...args: [TActivityLensMiddlewareArgs, number?]
	) => ActivityLens<_InContext>,
	InContext,
	[],
	typeof activityLensMiddlewareSpecification
> {
	protected middlewareSpec = activityLensMiddlewareSpecification;

	constructor(
		protected override lastArgs: [TActivityLensMiddlewareArgs, number] = [
			() => {},
			0,
		],
	) {
		super(
			(...args) =>
				new ActivityLens(args as [TActivityLensMiddlewareArgs, number]),
		);
	}

	getMiddleware() {
		return new ActivityLensMiddlewareFactory(() =>
			getLensActivityMiddleware(...this.lastArgs),
		);
	}
}

export const activityLens = new ActivityLens();
