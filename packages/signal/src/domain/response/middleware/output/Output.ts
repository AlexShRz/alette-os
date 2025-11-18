import { ISchema, as } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { ResponseAdapter } from "../../adapter/ResponseAdapter";
import { IOriginalRequestResponseValue } from "./OriginalResponseValue";
import { OutputMiddleware } from "./OutputMiddleware";
import { OutputMiddlewareFactory } from "./OutputMiddlewareFactory";
import { outputMiddlewareSpecification } from "./outputMiddlewareSpecification";

export type TOutputMiddlewareArgs<Value = unknown> =
	| ISchema<unknown, Value>
	| ResponseAdapter<Value>;

export class Output<
	InContext extends IRequestContext,
	ResponseValue,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, ResponseValue>(
		args: TOutputMiddlewareArgs<ResponseValue>,
	) => Output<_InContext, ResponseValue>,
	InContext,
	[
		IRequestContextPatch<{
			types: IOriginalRequestResponseValue<ResponseValue>;
		}>,
	],
	typeof outputMiddlewareSpecification
> {
	protected middlewareSpec = outputMiddlewareSpecification;

	constructor(
		protected override lastArgs: TOutputMiddlewareArgs = as<unknown>(),
	) {
		super((args) => new Output(args as TOutputMiddlewareArgs));
	}

	getMiddleware() {
		return new OutputMiddlewareFactory(
			() => new OutputMiddleware(this.lastArgs),
		);
	}
}

export const output = /* @__PURE__ */ new Output();
