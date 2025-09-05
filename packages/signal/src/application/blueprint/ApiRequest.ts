import { IAnyRequestSpecification } from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestArguments } from "../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSessionSettingSupplier } from "../../domain/execution/services/RequestSessionContext";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";

export abstract class ApiRequest<
	PrevContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends IAnyRequestSpecification = IAnyRequestSpecification,
	R = never,
	ER = never,
> {
	/**
	 * Helps us figure out where to route the request
	 * */
	protected executionThreadId = uuid();

	protected settingSupplier: IRequestSessionSettingSupplier = () => ({});
	protected middlewareSuppliers: ReturnType<
		IMiddlewareSupplierFn<any, any, any, any>
	>[] = [];

	constructor(
		protected config: {
			runtime: ManagedRuntime.ManagedRuntime<R, ER>;
			lazyMiddlewareSuppliers: IMiddlewareSupplierFn<any, any, any, any>[];
		},
	) {
		this.middlewareSuppliers = config.lazyMiddlewareSuppliers.map((fn) =>
			fn(this as any),
		);
	}

	protected addMiddlewareSuppliers(
		lazyMiddlewareSuppliers: IMiddlewareSupplierFn<any, any, any, any>[],
	) {
		this.middlewareSuppliers = [
			...this.middlewareSuppliers,
			...lazyMiddlewareSuppliers.map((fn) => fn(this as any)),
		];
	}

	using(supplier: () => TRequestArguments<Context>[number]) {
		this.settingSupplier = supplier;
		return this.clone();
	}

	abstract clone(): this;
}
