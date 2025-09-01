import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { RequestMiddleware } from "../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { IRequestArguments } from "../../RequestArguments";
import {
	IInputMiddlewareArgSchema,
	InputMiddleware,
	InputMiddlewareArgProvider,
} from "./InputMiddleware";
import { InputMiddlewareInjector } from "./InputMiddlewareInjector";
import { inputMiddlewareSpecification } from "./inputMiddlewareSpecification";

type Spec = typeof inputMiddlewareSpecification;

export class InputMiddlewareFacade<
	ArgType,
	Context extends IRequestContext,
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
		return <Context extends IRequestContext, ArgType>(
			argSchema: IInputMiddlewareArgSchema<ArgType>,
			argSupplier?: InputMiddlewareArgProvider<ArgType>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					Context["value"],
					Context["meta"],
					TMergeRecords<Context["settings"], IRequestArguments<ArgType>>,
					TMergeRecords<Context["accepts"], IRequestArguments<ArgType>>
				>,
				Spec
			>(() => new InputMiddlewareFacade(argSchema, argSupplier));
		};
	}
}
