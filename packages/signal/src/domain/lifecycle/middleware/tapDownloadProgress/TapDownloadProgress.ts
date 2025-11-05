import { IDownloadProgressData } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapDownloadProgressMiddleware } from "./TapDownloadProgressMiddleware";
import { TapDownloadProgressMiddlewareFactory } from "./TapDownloadProgressMiddlewareFactory";
import { tapDownloadProgressMiddlewareSpecification } from "./tapDownloadProgressMiddlewareSpecification";

export type TTapDownloadProgressArgs<
	C extends IRequestContext = IRequestContext,
> = (
	downloadProgressData: IDownloadProgressData,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapDownloadProgress<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapDownloadProgressArgs<_InContext>,
	) => TapDownloadProgress<_InContext>,
	InContext,
	[],
	typeof tapDownloadProgressMiddlewareSpecification
> {
	protected middlewareSpec = tapDownloadProgressMiddlewareSpecification;

	constructor(
		protected override lastArgs: TTapDownloadProgressArgs<any> = () => {},
	) {
		super((args) => new TapDownloadProgress(args));
	}

	getMiddleware() {
		return new TapDownloadProgressMiddlewareFactory(
			() => new TapDownloadProgressMiddleware(this.lastArgs),
		);
	}
}

export const tapDownloadProgress = new TapDownloadProgress();
