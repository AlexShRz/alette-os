import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { IRequestContext } from "../../context/IRequestContext";
import { IMiddlewareSupplierFn } from "../../interceptors/middleware/IMiddlewareSupplierFn";
import { AbstractBlueprintBuilder } from "../AbstractBlueprintBuilder";
import { OneShotRequest } from "./OneShotRequest";

export const blueprint = () => new RequestBlueprintBuilder();

export class RequestBlueprintBuilder<
	PContext extends IRequestContext,
	Context extends IRequestContext,
	RequestSpec extends IAnyRequestSpecification,
	/**
	 * Runtime types below
	 * */
	R,
	ER,
> extends AbstractBlueprintBuilder<R, ER> {
	protected savedSpecs: RequestSpec | null = null;

	specification<T extends IAnyRequestSpecification>(
		specs: T,
	): RequestBlueprintBuilder<PContext, Context, T, R, ER> {
		this.savedSpecs = specs as any;
		return this as any;
	}

	executor<NR, NER>(
		passedRuntime: ManagedRuntime.ManagedRuntime<NR, NER>,
	): RequestBlueprintBuilder<PContext, Context, RequestSpec, NR, NER> {
		this.blueprintRuntime = passedRuntime as any;
		return this as any;
	}

	protected assertSpecProvided(): asserts this is { savedSpecs: RequestSpec } {
		if (!this.savedSpecs) {
			throw new Error(
				"[RequestBlueprintBuilder] - specification for the request was not provided.",
			);
		}
	}

	build() {
		this.assertSpecProvided();
		this.assertRuntimeProvided();
		return new OneShotRequest<PContext, Context, RequestSpec>({
			lazyMiddlewareSuppliers: [...this.defaultMiddlewareFactories],
		});
	}

	use<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
	): RequestBlueprintBuilder<Context, NC1, RequestSpec, R, ER>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
	): RequestBlueprintBuilder<NC1, NC2, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC2, NC3, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC3, NC4, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC4, NC5, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC5, NC6, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC6, NC7, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC7, NC8, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC8, NC9, RequestSpec, R, ER>;

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
	): RequestBlueprintBuilder<NC9, NC10, RequestSpec, R, ER>;

	use(
		...middlewareFns: IMiddlewareSupplierFn<any, any, any, any>[]
	): RequestBlueprintBuilder<any, any, any, any, any> {
		this._use(...middlewareFns);
		return this as any;
	}
}
