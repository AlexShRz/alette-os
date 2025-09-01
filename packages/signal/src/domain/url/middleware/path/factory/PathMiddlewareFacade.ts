import { IRequestContext } from "../../../../context/IRequestContext";
import { TMergeContextAdapters } from "../../../../context/typeUtils/TMergeContextAdapters";
import { TMergeRecords } from "../../../../context/typeUtils/TMergeRecords";
import { GlobalMiddlewarePriority } from "../../../../middleware/GlobalMiddlewarePriority";
import { RequestMiddleware } from "../../../../middleware/RequestMiddleware";
import { toMiddlewareFactory } from "../../../../middleware/toMiddlewareFactory";
import { UrlContext } from "../../../UrlContext";
import { PathMiddleware, TPathMiddlewareArgs } from "../PathMiddleware";
import { IRequestPath } from "../RequestPath";
import { pathMiddlewareSpecification } from "../pathMiddlewareSpecification";
import { PathMiddlewareFactory } from "./PathMiddlewareFactory";

type Spec = typeof pathMiddlewareSpecification;

export class PathMiddlewareFacade<
	Path extends string,
	Context extends IRequestContext,
> extends RequestMiddleware<Context, Spec> {
	constructor(args: TPathMiddlewareArgs<Path, Context>) {
		super(() =>
			PathMiddlewareFactory.Default(
				() =>
					new RequestMiddleware(
						() => PathMiddleware.Default(args as TPathMiddlewareArgs),
						{
							priority: GlobalMiddlewarePriority.Creational,
						},
					),
			),
		);
	}

	static toFactory() {
		return <Context extends IRequestContext, Path extends string>(
			args: TPathMiddlewareArgs<Path, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeContextAdapters<Context, UrlContext>,
					TMergeRecords<Context["value"], IRequestPath<Path>>,
					Context["meta"],
					Context["settings"],
					Context["accepts"]
				>,
				Spec
			>(() => new PathMiddlewareFacade(args));
		};
	}
}
