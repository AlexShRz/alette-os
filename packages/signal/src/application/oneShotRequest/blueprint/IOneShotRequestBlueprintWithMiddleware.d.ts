import {
	IAnyMiddlewareSpecification,
	IRequestContext,
	RequestSpecification,
	TVerifyMiddlewareSupplier,
} from "../../../domain";
import { IMiddlewareSupplier } from "../../../domain/middleware/IMiddlewareSupplier";
import type { OneShotRequestBlueprint } from "./OneShotRequestBlueprint";

export interface IOneShotRequestBlueprintWithMiddleware<
	Context extends IRequestContext,
	RequestSpec extends RequestSpecification,
> {
	use<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC1, RequestSpec>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC2, RequestSpec>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContext,
		MC3 extends IAnyMiddlewareSpecification,
	>(
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC3, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC4, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC5, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
		fn6: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC6, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
		fn6: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>
		>,
		fn7: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC7, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
		fn6: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>
		>,
		fn7: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>
		>,
		fn8: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC8, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
		fn6: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>
		>,
		fn7: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>
		>,
		fn8: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>
		>,
		fn9: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC8, NC9, MC9, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC9, RequestSpec>;

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
		fn1: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<Context, NC1, MC1, RequestSpec>
		>,
		fn2: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC1, NC2, MC2, RequestSpec>
		>,
		fn3: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC2, NC3, MC3, RequestSpec>
		>,
		fn4: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC3, NC4, MC4, RequestSpec>
		>,
		fn5: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC4, NC5, MC5, RequestSpec>
		>,
		fn6: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC5, NC6, MC6, RequestSpec>
		>,
		fn7: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC6, NC7, MC7, RequestSpec>
		>,
		fn8: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC7, NC8, MC8, RequestSpec>
		>,
		fn9: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC8, NC9, MC9, RequestSpec>
		>,
		fn10: TVerifyMiddlewareSupplier<
			RequestSpec,
			IMiddlewareSupplier<NC9, NC10, MC10, RequestSpec>
		>,
	): OneShotRequestBlueprint<Context, NC10, RequestSpec>;
}
