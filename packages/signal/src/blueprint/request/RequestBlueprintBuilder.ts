import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
} from "@alette/pulse";
import { IRequestContext } from "../../context/IRequestContext";
import { IMiddlewareSupplierFn } from "../../middleware/IMiddlewareSupplierFn";
import { AbstractBlueprintBuilder } from "../AbstractBlueprintBuilder";
import { OneShotRequest } from "./OneShotRequest";

export class RequestBlueprintBuilder<
	PContext extends IRequestContext,
	Context extends IRequestContext,
	RequestSpec extends IAnyRequestSpecification,
> extends AbstractBlueprintBuilder {
	protected savedSpecs: RequestSpec | null = null;

	specification<T extends IAnyRequestSpecification>(
		specs: T,
	): RequestBlueprintBuilder<PContext, Context, T> {
		this.savedSpecs = specs as any;
		return this as any;
	}

	protected assertSpecsProvided(): asserts this is { savedSpecs: RequestSpec } {
		if (!this.savedSpecs) {
			throw new Error(
				"[RequestBlueprintBuilder] - specification for the request was not provided.",
			);
		}
	}

	build() {
		this.assertSpecsProvided();
		return new OneShotRequest();
	}

	use<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
	): RequestBlueprintBuilder<Context, NC1, RequestSpec>;

	use<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
	): RequestBlueprintBuilder<NC1, NC2, RequestSpec>;

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
	): RequestBlueprintBuilder<NC3, NC3, RequestSpec>;

	use(
		...middlewareFns: IMiddlewareSupplierFn<any, any, any, any>[]
	): RequestBlueprintBuilder<any, any, any> {
		return this as any;
	}
}
