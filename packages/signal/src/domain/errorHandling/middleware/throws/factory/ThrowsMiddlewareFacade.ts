import { IRequestContext } from "../../../../context/IRequestContext";
import { TMergeRecords } from "../../../../context/typeUtils/TMergeRecords";
import { GlobalMiddlewarePriority } from "../../../../middleware/GlobalMiddlewarePriority";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../../middleware/toMiddlewareFactory";
import {
	IRecoverableApiError,
	TAddDefaultErrors,
} from "../RequestRecoverableErrors";
import { ThrowsMiddleware } from "../ThrowsMiddleware";
import { throwsMiddlewareSpecification } from "../throwsMiddlewareSpecification";
import { ThrowsMiddlewareFactory } from "./ThrowsMiddlewareFactory";

type Spec = typeof throwsMiddlewareSpecification;

export class ThrowsMiddlewareFacade<
	RecoverableErrors extends IRecoverableApiError[],
	Context extends IRequestContext,
> extends RequestMiddleware<Context, Spec> {
	constructor(...errors: [...RecoverableErrors]) {
		super(() =>
			ThrowsMiddlewareFactory.Default(
				() =>
					new RequestMiddleware(() => ThrowsMiddleware.Default(errors), {
						priority: GlobalMiddlewarePriority.Creational,
					}),
			),
		);
	}

	static toFactory() {
		return <
			Context extends IRequestContext,
			RecoverableErrors extends IRecoverableApiError[],
		>(
			...errors: [...RecoverableErrors]
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TAddDefaultErrors<Context, RecoverableErrors>,
					Context["value"],
					Context["meta"],
					Context["settings"],
					Context["accepts"]
				>,
				Spec
			>(() => new ThrowsMiddlewareFacade(...errors));
		};
	}
}
