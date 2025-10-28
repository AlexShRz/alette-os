import { THttpMethod } from "@alette/pulse";
import { IRequestContext } from "../../../context";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { IRequestMethod } from "../../context/method/RequestMethod";
import { MethodMiddleware } from "./MethodMiddleware";
import { MethodMiddlewareFactory } from "./MethodMiddlewareFactory";
import { methodMiddlewareSpecification } from "./methodMiddlewareSpecification";

export type TMethodSupplier<
	Method extends THttpMethod = THttpMethod,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TFullRequestContext<C>) => Method | Promise<Method>)
	| Method;

export const method = <
	C extends IRequestContext,
	Method extends THttpMethod = THttpMethod,
>(
	supplier: TMethodSupplier<Method, C>,
) => {
	const middlewareGetter = () =>
		new MethodMiddlewareFactory(
			() => new MethodMiddleware(supplier as TMethodSupplier),
		);

	return new MiddlewareFacade<
		C,
		IRequestContext<
			C["types"],
			TMergeRecords<C["value"], IRequestMethod<Method>>,
			C["settings"],
			C["accepts"],
			C["acceptsMounted"]
		>
	>(
		methodMiddlewareSpecification,
		middlewareGetter,
		new MiddlewareFacade(methodMiddlewareSpecification, middlewareGetter),
	);
};

type GetContext<T> = T extends MiddlewareFacade<any, any, infer C> ? C : never;

const asd = method("POST");
const asdasdasdasd = asd();

type asda = GetContext<typeof asd>;
