import type { O } from "ts-toolbelt";
import { Callable } from "../../../shared/Callable";
import { IRequestContext } from "../../context";
import { IRequestContextPatch } from "../../context/RequestContextPatches";
import { IAnyMiddlewareSpecification } from "../../specification";
import { RequestMiddleware } from "../RequestMiddleware";
import { MiddlewareWasNotInitializedError } from "../error";

interface IMiddlewareFacadeConfig<
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContext extends IRequestContext,
> {
	name: string;
	lastArgs: Arguments;
	middlewareSpec: MiddlewareSpec;
	areArgsValid: (args: Arguments | undefined) => boolean;
	middlewareFactory: (
		args: Arguments,
	) => RequestMiddleware<OutContext, MiddlewareSpec>;
}

export class MiddlewareFacade<
	InContext extends IRequestContext,
	Arguments,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	OutContextPatches extends IRequestContextPatch<any, any>[] = [],
> extends Callable<
	<_InContext extends IRequestContext = InContext>(
		...args: Arguments extends undefined ? [] : [Arguments]
	) => MiddlewareFacade<
		_InContext,
		Arguments,
		MiddlewareSpec,
		OutContextPatches
	>
> {
	constructor(
		protected config: O.Optional<
			IMiddlewareFacadeConfig<MiddlewareSpec, Arguments, InContext>,
			"areArgsValid"
		>,
	) {
		super((args) => {
			return new MiddlewareFacade({
				...config,
				lastArgs: args as any,
			})(args);
		});
	}

	getMiddleware() {
		const { name, middlewareFactory, areArgsValid, lastArgs } = this.config;

		const canInitializeMiddleware =
			areArgsValid || ((args) => args !== undefined);

		if (!canInitializeMiddleware(lastArgs)) {
			throw new MiddlewareWasNotInitializedError(name, lastArgs);
		}

		return middlewareFactory(lastArgs);
	}

	getSpecification() {
		return this.config.middlewareSpec;
	}
}
