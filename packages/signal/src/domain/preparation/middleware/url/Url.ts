import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareWasNotInitializedError } from "../../../middleware";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TGetRequestOrigin } from "../origin/RequestOrigin";
import { TGetRequestPath } from "../path/RequestPath";
import { TGetRequestQueryParams } from "../queryParams/RequestQueryParams";
import { UrlMiddleware } from "./UrlMiddleware";
import { UrlMiddlewareFactory } from "./UrlMiddlewareFactory";
import { urlMiddlewareSpecification } from "./urlMiddlewareSpecification";

export interface IUrlMiddlewareCollectedUrlProps<
	C extends IRequestContext = IRequestContext,
> {
	origin: TGetRequestOrigin<C>;
	path: TGetRequestPath<C>;
	queryParams: TGetRequestQueryParams<C>;
}

export type TUrlMiddlewareArgs<C extends IRequestContext = IRequestContext> =
	| ((
			collectedUrlProps: IUrlMiddlewareCollectedUrlProps<C>,
			context: TFullRequestContext<C>,
	  ) => string)
	| string;

export class Url<InContext extends IRequestContext> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TUrlMiddlewareArgs<_InContext>,
	) => Url<_InContext>,
	InContext,
	[],
	typeof urlMiddlewareSpecification
> {
	protected middlewareSpec = urlMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| TUrlMiddlewareArgs<InContext>
			| undefined = undefined,
	) {
		super((args) => new Url(args));
	}

	getMiddleware() {
		if (!this.lastArgs) {
			throw new MiddlewareWasNotInitializedError("url");
		}

		return new UrlMiddlewareFactory(
			() => new UrlMiddleware(this.lastArgs as TUrlMiddlewareArgs),
		);
	}
}

export const url = /* @__PURE__ */ new Url();
