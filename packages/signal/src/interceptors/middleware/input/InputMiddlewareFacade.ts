import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/TMergeRecords";
import { IArgumentType } from "../../../context/sharedTypes/IArgumentType";
import { RequestMiddleware } from "../RequestMiddleware";
import { toMiddlewareFactory } from "../toMiddlewareFactory";
import {
	IInputMiddlewareArgSchema,
	InputMiddleware,
	InputMiddlewareArgProvider,
} from "./InputMiddleware";
import { InputMiddlewareInjector } from "./InputMiddlewareInjector";
import { inputMiddlewareSpecification } from "./inputMiddlewareSpecification";

export interface IInputMiddlewareContext
	extends IRequestContext<any, any, IArgumentType> {}

type Spec = typeof inputMiddlewareSpecification;

export class InputMiddlewareFacade<
	ArgType,
	Context extends IInputMiddlewareContext,
> extends RequestMiddleware<Context, Spec> {
	constructor(
		argSchema: IInputMiddlewareArgSchema<ArgType>,
		argSupplier: InputMiddlewareArgProvider<ArgType>,
	) {
		super(() =>
			InputMiddlewareInjector.Default(() =>
				InputMiddleware.Default(argSchema, argSupplier),
			),
		);
	}

	static toFactory() {
		return <Context extends IInputMiddlewareContext, ArgType>(
			argSchema: IInputMiddlewareArgSchema<ArgType>,
			argSupplier?: InputMiddlewareArgProvider<ArgType>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					Context["meta"],
					TMergeRecords<Context["settings"], IArgumentType<ArgType>>,
					TMergeRecords<Context["accepts"], IArgumentType<ArgType>>
				>,
				Spec
			>(() => new InputMiddlewareFacade(argSchema, argSupplier));
		};
	}
}
