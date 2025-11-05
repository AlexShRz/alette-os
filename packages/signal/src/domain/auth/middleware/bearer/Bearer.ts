import { Cookie, Token } from "../../../../application";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareWasNotInitializedError } from "../../../middleware";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { BearerMiddleware } from "./BearerMiddleware";
import { BearerMiddlewareFactory } from "./BearerMiddlewareFactory";
import { TBearerTokenHeaders } from "./BearerTypes";
import { bearerMiddlewareSpecification } from "./bearerMiddlewareSpecification";

export type TBearerMiddlewareArgs<
	Entity extends Token | Cookie = Token | Cookie,
> = ((context: TRequestGlobalContext) => Entity | Promise<Entity>) | Entity;

export class Bearer<
	InContext extends IRequestContext,
	AuthEntityType extends Token | Cookie,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, AuthEntityType extends Token | Cookie>(
		args: TBearerMiddlewareArgs<AuthEntityType>,
	) => Bearer<_InContext, AuthEntityType>,
	InContext,
	[
		IRequestContextPatch<{
			value: AuthEntityType extends false
				? { credentials: false }
				: AuthEntityType extends Token
					? TBearerTokenHeaders<InContext, AuthEntityType>
					: { credentials: "include" };
		}>,
	],
	typeof bearerMiddlewareSpecification
> {
	protected middlewareSpec = bearerMiddlewareSpecification;

	constructor(
		protected override lastArgs:
			| TBearerMiddlewareArgs<any>
			| undefined = undefined,
	) {
		super((args) => new Bearer(args as TBearerMiddlewareArgs));
	}

	getMiddleware() {
		if (!this.lastArgs) {
			throw new MiddlewareWasNotInitializedError("bearer", this.lastArgs);
		}

		return new BearerMiddlewareFactory(
			() => new BearerMiddleware(this.lastArgs),
		);
	}
}

export const bearer = new Bearer();
