import { IUploadProgressData } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TapUploadProgressMiddleware } from "./TapUploadProgressMiddleware";
import { TapUploadProgressMiddlewareFactory } from "./TapUploadProgressMiddlewareFactory";
import { tapUploadProgressMiddlewareSpecification } from "./tapUploadProgressMiddlewareSpecification";

export type TTapUploadProgressArgs<
	C extends IRequestContext = IRequestContext,
> = (
	uploadProgressData: IUploadProgressData,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapUploadProgress<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TTapUploadProgressArgs<_InContext>,
	) => TapUploadProgress<_InContext>,
	InContext,
	[],
	typeof tapUploadProgressMiddlewareSpecification
> {
	protected middlewareSpec = tapUploadProgressMiddlewareSpecification;

	constructor(
		protected override lastArgs: TTapUploadProgressArgs<any> = () => {},
	) {
		super((args) => new TapUploadProgress(args));
	}

	getMiddleware() {
		return new TapUploadProgressMiddlewareFactory(
			() => new TapUploadProgressMiddleware(this.lastArgs),
		);
	}
}

export const tapUploadProgress = new TapUploadProgress();
