import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import {
	TFullRequestContext,
	TOriginalRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { IRetrySettings } from "../RetrySettings";
import { RetryWhenMiddleware } from "./RetryWhenMiddleware";
import { RetryWhenMiddlewareFactory } from "./RetryWhenMiddlewareFactory";
import { retryWhenMiddlewareSpecification } from "./retryWhenMiddlewareSpecification";

export interface IRetryWhenMiddlewareArgs<
	C extends IRequestContext = IRequestContext,
> {
	(
		errorContext: {
			error: TOriginalRequestError<C>;
			attempt: number;
		},
		requestContext: TFullRequestContext<C>,
	): boolean | Promise<boolean>;
}

export class RetryWhen<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: IRetryWhenMiddlewareArgs<_InContext>,
	) => RetryWhen<_InContext>,
	InContext,
	[
		IRequestContextPatch<{
			accepts: IRetrySettings;
			acceptsMounted: IRetrySettings;
		}>,
	],
	typeof retryWhenMiddlewareSpecification
> {
	protected middlewareSpec = retryWhenMiddlewareSpecification;

	constructor(
		protected override lastArgs: IRetryWhenMiddlewareArgs<any> = () => false,
	) {
		super((args) => new RetryWhen(args));
	}

	getMiddleware() {
		return new RetryWhenMiddlewareFactory(
			() => new RetryWhenMiddleware(this.lastArgs),
		);
	}
}

export const retryWhen = /* @__PURE__ */ new RetryWhen();
