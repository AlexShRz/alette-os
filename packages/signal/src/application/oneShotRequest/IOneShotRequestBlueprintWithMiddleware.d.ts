import {
	IAnyMiddlewareSpecification,
	RequestSpecification,
} from "@alette/pulse";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import type { OneShotRequestBlueprint } from "./OneShotRequestBlueprint";

export interface IOneShotRequestBlueprintWithMiddleware<
	Context extends IRequestContext,
	RequestSpec extends RequestSpecification,
	R,
	ER,
> {
	use<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
	): OneShotRequestBlueprint<Context, NC1, RequestSpec, R, ER>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
	): OneShotRequestBlueprint<NC1, NC2, RequestSpec, R, ER>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
	): OneShotRequestBlueprint<NC2, NC3, RequestSpec, R, ER>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
		NC4 extends IRequestContext,
		MC4 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
	): OneShotRequestBlueprint<NC3, NC4, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
	): OneShotRequestBlueprint<NC4, NC5, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
	): OneShotRequestBlueprint<NC5, NC6, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
	): OneShotRequestBlueprint<NC6, NC7, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplierFn<NC7, NC8, MC8, RequestSpec>,
	): OneShotRequestBlueprint<NC7, NC8, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplierFn<NC7, NC8, MC8, RequestSpec>,
		fn9: IMiddlewareSupplierFn<NC8, NC9, MC9, RequestSpec>,
	): OneShotRequestBlueprint<NC8, NC9, RequestSpec, R, ER>;

	use<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplierFn<NC7, NC8, MC8, RequestSpec>,
		fn9: IMiddlewareSupplierFn<NC8, NC9, MC9, RequestSpec>,
		fn10: IMiddlewareSupplierFn<NC9, NC10, MC10, RequestSpec>,
	): OneShotRequestBlueprint<NC9, NC10, RequestSpec, R, ER>;
}
