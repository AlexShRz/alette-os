import {
	IAnyMiddlewareSpecification,
	RequestSpecification,
} from "@alette/pulse";
import { IRequestContext } from "../../domain/context/IRequestContext";
import {
	TRequestArguments,
	TRequestResponse,
} from "../../domain/context/typeUtils/RequestIOTypes";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import { ApiRequest } from "../blueprint/ApiRequest";
import { OneShotRequestController } from "./controller/OneShotRequestController";

export class OneShotRequest<
	PrevContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends RequestSpecification = RequestSpecification,
	R = never,
	ER = never,
> extends ApiRequest<PrevContext, Context, RequestSpec, R, ER> {
	// clone() {
	// 	return new OneShotRequest<PrevContext, Context, RequestSpec>({
	// 		lazyMiddlewareSuppliers: [
	// 			this.middlewareSuppliers.map((fn) => {
	// 				return;
	// 				(middleware: RequestMiddleware<any, any>) => fn(middleware);
	// 			}),
	// 		],
	// 	}) as this;
	// }

	asFunction() {
		return this.with.bind(this);
	}

	async execute(
		...args: TRequestArguments<Context>
	): Promise<TRequestResponse<Context>> {
		const controller = new OneShotRequestController(this.config.runtime, {
			threadId: this.executionThreadId,
			requestMode: "oneShot",
		});

		const { execute } = controller.getInitialState();
		execute(...args);
		return controller.awaitResult().finally(() => {
			controller.dispose();
		});
	}

	control() {
		return new OneShotRequestController(this.config.runtime, {
			threadId: this.executionThreadId,
			requestMode: "subscription",
		});
	}

	with<NC1 extends IRequestContext, MC1 extends IAnyMiddlewareSpecification>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
	): OneShotRequest<Context, NC1, RequestSpec>;

	with<
		NC1 extends IRequestContext,
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContext,
		MC2 extends IAnyMiddlewareSpecification,
	>(
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
	): OneShotRequest<NC1, NC2, RequestSpec>;

	with<
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplierFn<NC7, NC8, MC8, RequestSpec>,
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
		fn1: IMiddlewareSupplierFn<Context, NC1, MC1, RequestSpec>,
		fn2: IMiddlewareSupplierFn<NC1, NC2, MC2, RequestSpec>,
		fn3: IMiddlewareSupplierFn<NC2, NC3, MC3, RequestSpec>,
		fn4: IMiddlewareSupplierFn<NC3, NC4, MC4, RequestSpec>,
		fn5: IMiddlewareSupplierFn<NC4, NC5, MC5, RequestSpec>,
		fn6: IMiddlewareSupplierFn<NC5, NC6, MC6, RequestSpec>,
		fn7: IMiddlewareSupplierFn<NC6, NC7, MC7, RequestSpec>,
		fn8: IMiddlewareSupplierFn<NC7, NC8, MC8, RequestSpec>,
		fn9: IMiddlewareSupplierFn<NC8, NC9, MC9, RequestSpec>,
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
	): OneShotRequest<NC9, NC10, RequestSpec>;

	with(
		...middlewareFns: IMiddlewareSupplierFn<any, any, any, any>[]
	): OneShotRequest<any, any, any> {
		// this._use(...middlewareFns);
		return this as any;
	}
}
