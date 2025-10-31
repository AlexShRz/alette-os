import type { O } from "ts-toolbelt";
import { Callable } from "../../../shared/Callable";
import { IRequestContext } from "../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../context/RequestContextPatches";
import type { IAnyMiddlewareSpecification } from "../../specification";
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
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[] = [],
> extends Callable<
	[Arguments],
	<_Arguments, _OutContextPatches extends IRequestContextPatch<any, any>[]>(
		args: _Arguments[],
	) => MiddlewareFacade<
		TApplyRequestContextPatches<InContext, OutContextPatches>,
		MiddlewareSpec,
		_Arguments,
		_OutContextPatches
	>
> {
	constructor(
		protected config: O.Optional<
			IMiddlewareFacadeConfig<MiddlewareSpec, Arguments, any>,
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
