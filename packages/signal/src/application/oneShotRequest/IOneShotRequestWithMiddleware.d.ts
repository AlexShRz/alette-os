import {
	IAnyMiddlewareSpecification,
	RequestSpecification,
} from "../../domain";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { IMiddlewareSupplier } from "../../domain/middleware/IMiddlewareSupplier";
import type { OneShotRequest } from "./OneShotRequest";

export interface IOneShotRequestWithMiddleware<
	Context extends IRequestContext,
	RequestSpec extends RequestSpecification,
> {
	with<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
	): OneShotRequest<Context, NC1, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
	): OneShotRequest<NC1, NC2, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
	): OneShotRequest<NC2, NC3, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
	): OneShotRequest<NC3, NC4, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
	): OneShotRequest<NC4, NC5, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContext,
		MC6 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>,
	): OneShotRequest<NC5, NC6, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContext,
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContext,
		MC7 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>,
	): OneShotRequest<NC6, NC7, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContext,
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContext,
		MC7 extends IAnyMiddlewareSpecification,
		NC8 extends IRequestContext,
		MC8 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>,
	): OneShotRequest<NC7, NC8, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContext,
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContext,
		MC7 extends IAnyMiddlewareSpecification,
		NC8 extends IRequestContext,
		MC8 extends IAnyMiddlewareSpecification,
		NC9 extends IRequestContext,
		MC9 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>,
		fn9: IMiddlewareSupplier<NC8, NC9, MC9, RequestSpec>,
	): OneShotRequest<NC8, NC9, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
		NC5 extends IRequestContext,
		MC5 extends IAnyMiddlewareSpecification,
		NC6 extends IRequestContext,
		MC6 extends IAnyMiddlewareSpecification,
		NC7 extends IRequestContext,
		MC7 extends IAnyMiddlewareSpecification,
		NC8 extends IRequestContext,
		MC8 extends IAnyMiddlewareSpecification,
		NC9 extends IRequestContext,
		MC9 extends IAnyMiddlewareSpecification,
		NC10 extends IRequestContext,
		MC10 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>,
		fn9: IMiddlewareSupplier<NC8, NC9, MC9, RequestSpec>,
		fn10: IMiddlewareSupplier<NC9, NC10, MC10, RequestSpec>,
	): OneShotRequest<NC9, NC10, RequestSpec>;
}
