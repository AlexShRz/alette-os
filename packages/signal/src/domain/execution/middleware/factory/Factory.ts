import { UrlBuilder } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { OneShotRequestNotification } from "../../../lifecycle/notifications/OneShotRequestNotification";
import { MiddlewareWasNotInitializedError } from "../../../middleware";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { TGetRequestQueryParams } from "../../../preparation/middleware/queryParams/RequestQueryParams";
import { TGetOriginalRequestResponseValue } from "../../../response/middleware/output/OriginalResponseValue";
import { FactoryMiddleware } from "./FactoryMiddleware";
import { FactoryMiddlewareFactory } from "./FactoryMiddlewareFactory";
import { factoryMiddlewareSpecification } from "./factoryMiddlewareSpecification";

export interface IRequestRunner<C extends IRequestContext = IRequestContext> {
	(
		requestContext: TFullRequestContext<C> & {
			url: UrlBuilder<TGetRequestQueryParams<C>>;
		},
		utils: {
			notify: (notification: OneShotRequestNotification) => void;
			signal: AbortSignal;
		},
	):
		| Promise<TGetOriginalRequestResponseValue<C>>
		| TGetOriginalRequestResponseValue<C>
		| Promise<unknown>
		| unknown;
}

export class Factory<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: IRequestRunner<_InContext>,
	) => Factory<_InContext>,
	InContext,
	[],
	typeof factoryMiddlewareSpecification
> {
	protected middlewareSpec = factoryMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| IRequestRunner<InContext>
			| undefined = undefined,
	) {
		super((args) => new Factory(args));
	}

	getMiddleware() {
		if (!this.lastArgs) {
			throw new MiddlewareWasNotInitializedError("factory", this.lastArgs);
		}

		return new FactoryMiddlewareFactory(
			() => new FactoryMiddleware(this.lastArgs),
		);
	}
}

export const factory = /* @__PURE__ */ new Factory();
