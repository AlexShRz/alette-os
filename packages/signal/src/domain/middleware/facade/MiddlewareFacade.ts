import type { O } from "ts-toolbelt";
import { Callable } from "../../../shared/Callable";
import { IRequestContext } from "../../context";
import { IRequestContextPatch } from "../../context/RequestContextPatches";
import { IAnyMiddlewareSpecification } from "../../specification";
import { RequestMiddleware } from "../RequestMiddleware";
import { MiddlewareWasNotInitializedError } from "../error";

interface IMiddlewareFacadeConfig<
	Name extends string,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContext extends IRequestContext,
> {
	name: Name;
	lastArgs: Arguments;
	middlewareSpec: MiddlewareSpec;
	areArgsValid: (args: Arguments | undefined) => boolean;
	middlewareFactory: (
		args: Arguments,
	) => RequestMiddleware<OutContext, MiddlewareSpec>;
}

export class MiddlewareFacade<
	const Name extends string,
	InContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[] = [],
> extends Callable<
	[Arguments],
	<_Arguments, _OutContextPatches extends IRequestContextPatch<any, any>[]>(
		args: _Arguments[],
	) => MiddlewareFacade<
		Name,
		InContext,
		MiddlewareSpec,
		_Arguments,
		OutContextPatches
	>
> {
	constructor(
		protected config: O.Optional<
			IMiddlewareFacadeConfig<Name, MiddlewareSpec, Arguments, any>,
			"areArgsValid"
		>,
	) {
		super((args) => new MiddlewareFacade(config)(args));
	}

	getMiddleware() {
		const { name, middlewareFactory, areArgsValid, lastArgs } = this.config;

		const canInitializeMiddleware =
			areArgsValid || ((args) => args !== undefined);

		if (!canInitializeMiddleware(lastArgs)) {
			throw new MiddlewareWasNotInitializedError(
				name,
				`Last passed arguments - "${lastArgs}".`,
			);
		}

		return middlewareFactory(lastArgs);
	}

	getSpecification() {
		return this.config.middlewareSpec;
	}
}
