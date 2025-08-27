import { IRequestContext } from "../../context/IRequestContext";
import { MergeRecords } from "../../context/MergeRecords";
import { IArgumentType } from "../../context/sharedTypes/IArgumentType";
import { ApiMiddleware } from "../ApiMiddleware";
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
> extends ApiMiddleware<Context, Spec> {
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
		) =>
			toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					MergeRecords<Context["settings"], IArgumentType<ArgType>>,
					Context["meta"]
				>,
				Spec
			>(() => new InputMiddlewareFacade(argSchema, argSupplier));
	}
}
