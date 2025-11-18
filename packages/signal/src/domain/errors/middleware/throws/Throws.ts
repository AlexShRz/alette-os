import { RequestFailedError } from "@alette/pulse";
import { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import {
	IRecognizedRequestError,
	TAddDefaultRequestErrors,
} from "./RequestRecoverableErrors";
import { ThrowsMiddleware } from "./ThrowsMiddleware";
import { ThrowsMiddlewareFactory } from "./ThrowsMiddlewareFactory";
import { throwsMiddlewareSpecification } from "./throwsMiddlewareSpecification";

export class Throws<
	InContext extends IRequestContext,
	RecoverableErrors extends IRecognizedRequestError[] = [
		Ctor<RequestFailedError>,
	],
> extends MiddlewareFacade<
	<
		_InContext extends IRequestContext,
		RecoverableErrors extends IRecognizedRequestError[],
	>(
		...errors: [...RecoverableErrors]
	) => Throws<_InContext, RecoverableErrors>,
	InContext,
	[TAddDefaultRequestErrors<RecoverableErrors>],
	typeof throwsMiddlewareSpecification
> {
	protected middlewareSpec = throwsMiddlewareSpecification;

	constructor(
		protected override lastArgs: IRecognizedRequestError[] = [
			RequestFailedError,
		],
	) {
		super((...args) => new Throws(args));
	}

	getMiddleware() {
		return new ThrowsMiddlewareFactory(
			() => new ThrowsMiddleware(this.lastArgs),
		);
	}
}

export const throws = /* @__PURE__ */ new Throws();
