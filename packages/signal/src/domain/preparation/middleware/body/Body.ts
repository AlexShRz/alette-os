import { THttpBody } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { IRequestBody } from "../../context/body/RequestBody";
import { BodyMiddleware } from "./BodyMiddleware";
import { BodyMiddlewareFactory } from "./BodyMiddlewareFactory";
import { bodyMiddlewareSpecification } from "./bodyMiddlewareSpecification";

export type TBodySupplier<
	NextBody extends THttpBody = THttpBody,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TFullRequestContext<C>) => NextBody | Promise<NextBody>)
	| NextBody;

export class Body<
	InContext extends IRequestContext,
	NewBody extends THttpBody,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, NewBody extends THttpBody>(
		args: TBodySupplier<NewBody, _InContext>,
	) => Body<_InContext, NewBody>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestBody<NewBody>;
		}>,
		/**
		 * 1. If our headers are non-existent,
		 * set empty record to act as a header type.
		 * 2. This allows us to access this property in context
		 * without getting ts errors, while also keeping system
		 * injected body headers hidden from the type system.
		 * */
		IRequestContextPatch<
			{
				value: {
					headers: {};
				};
			},
			"merge"
		>,
	],
	typeof bodyMiddlewareSpecification
> {
	protected middlewareSpec = bodyMiddlewareSpecification;

	constructor(protected override lastArgs: TBodySupplier<any, any> = {}) {
		super((args) => new Body(args));
	}

	getMiddleware() {
		return new BodyMiddlewareFactory(() => new BodyMiddleware(this.lastArgs));
	}
}

export const body = new Body();
