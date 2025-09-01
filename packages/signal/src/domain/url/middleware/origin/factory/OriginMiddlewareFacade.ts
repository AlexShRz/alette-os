import { IRequestContext } from "../../../../context/IRequestContext";
import { TMergeContextAdapters } from "../../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../../context/typeUtils/TMergeRecords";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../../middleware/toMiddlewareFactory";
import { UrlContext } from "../../../UrlContext";
import { OriginMiddleware, TOriginMiddlewareArgs } from "../OriginMiddleware";
import { IRequestOrigin } from "../RequestOrigin";
import { originMiddlewareSpecification } from "../originMiddlewareSpecification";
import { OriginMiddlewareFactory } from "./OriginMiddlewareFactory";

type Spec = typeof originMiddlewareSpecification;

export class OriginMiddlewareFacade<
	Path extends string,
	Context extends IRequestContext,
> extends RequestMiddleware<Context, Spec> {
	constructor(args: TOriginMiddlewareArgs<Path, Context>) {
		super(() =>
			OriginMiddlewareFactory.Default(
				() =>
					new RequestMiddleware(() =>
						OriginMiddleware.Default(args as TOriginMiddlewareArgs),
					),
			),
		);
	}

	static toFactory() {
		return <Context extends IRequestContext, Origin extends string>(
			args?: TOriginMiddlewareArgs<Origin, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeContextAdapters<Context, UrlContext>,
					TMergeRecords<Context["value"], IRequestOrigin<Origin>>,
					Context["meta"],
					Context["settings"],
					Context["accepts"]
				>,
				Spec
			>(() => new OriginMiddlewareFacade(args));
		};
	}
}
