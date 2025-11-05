import { RequestAbortedError } from "@alette/pulse";
import type { Ctor } from "effect/Types";
import { IRequestContext } from "../../../context";
import { TAddDefaultRequestErrors } from "../../../errors/middleware/throws/RequestRecoverableErrors";
import { MiddlewareWasNotInitializedError } from "../../../middleware";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { AbortedByMiddleware } from "./AbortedByMiddleware";
import { AbortedByMiddlewareFactory } from "./AbortedByMiddlewareFactory";
import { abortedByMiddlewareSpecification } from "./abortedByMiddlewareSpecification";

export type TAbortedByArgs = AbortController | AbortSignal;

export class AbortedBy<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args: TAbortedByArgs,
	) => AbortedBy<_InContext>,
	InContext,
	[TAddDefaultRequestErrors<[Ctor<RequestAbortedError>]>],
	typeof abortedByMiddlewareSpecification
> {
	protected middlewareSpec = abortedByMiddlewareSpecification;

	constructor(
		protected override lastArgs: TAbortedByArgs | undefined = undefined,
	) {
		super((args) => new AbortedBy(args));
	}

	getMiddleware() {
		if (!this.lastArgs) {
			throw new MiddlewareWasNotInitializedError("abortedBy");
		}

		return new AbortedByMiddlewareFactory(
			() => new AbortedByMiddleware(this.lastArgs as TAbortedByArgs),
		);
	}
}

export const abortedBy = new AbortedBy();
