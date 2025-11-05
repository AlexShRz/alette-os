import { ISchema, as } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { IRequestArguments } from "../../context/arguments/RequestArguments";
import { ArgumentAdapter } from "../../context/arguments/adapter/ArgumentAdapter";
import { InputMiddleware } from "./InputMiddleware";
import { InputMiddlewareFactory } from "./InputMiddlewareFactory";
import { inputMiddlewareSpecification } from "./inputMiddlewareSpecification";

export type TInputMiddlewareArgValue<Arguments = unknown> =
	| ISchema<unknown, Arguments>
	| ArgumentAdapter<Arguments>;

export class Input<
	InContext extends IRequestContext,
	ArgType,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, ArgType>(
		args: TInputMiddlewareArgValue<ArgType>,
	) => Input<_InContext, ArgType>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestArguments<ArgType>;
			accepts: IRequestArguments<ArgType>;
			acceptsMounted: IRequestArguments<ArgType>;
		}>,
	],
	typeof inputMiddlewareSpecification
> {
	protected middlewareSpec = inputMiddlewareSpecification;

	constructor(
		protected override lastArgs: TInputMiddlewareArgValue = as<unknown>(),
	) {
		super((args) => new Input(args as TInputMiddlewareArgValue));
	}

	getMiddleware() {
		return new InputMiddlewareFactory(() => new InputMiddleware(this.lastArgs));
	}
}

export const input = new Input();
