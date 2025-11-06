import { TRecognizedApiDuration } from "../../../../shared";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { TRequestGlobalContext } from "../../../context/typeUtils/RequestIOTypes";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { DebounceMiddleware } from "./DebounceMiddleware";
import { DebounceMiddlewareFactory } from "./DebounceMiddlewareFactory";
import { IDebounceSettings } from "./DebounceSettings";
import { debounceMiddlewareSpecification } from "./debounceMiddlewareSpecification";

export type TDebounceMiddlewareDurationSupplier =
	| ((
			options: TRequestGlobalContext,
	  ) => TRecognizedApiDuration | Promise<TRecognizedApiDuration>)
	| TRecognizedApiDuration;

export class Debounce<
	InContext extends IRequestContext,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext>(
		args?: TDebounceMiddlewareDurationSupplier,
	) => Debounce<_InContext>,
	InContext,
	[
		IRequestContextPatch<{
			acceptsMounted: IDebounceSettings;
		}>,
	],
	typeof debounceMiddlewareSpecification
> {
	protected middlewareSpec = debounceMiddlewareSpecification;

	constructor(
		protected override lastArgs: TDebounceMiddlewareDurationSupplier = 300,
	) {
		super((args) => new Debounce(args));
	}

	getMiddleware() {
		return new DebounceMiddlewareFactory(
			() => new DebounceMiddleware(this.lastArgs),
		);
	}
}

export const debounce = /* @__PURE__ */ new Debounce();
