import { IAnyRequestSpecification } from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";

export abstract class ApiRequest<
	PrevContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends IAnyRequestSpecification = IAnyRequestSpecification,
	R = never,
	ER = never,
> {
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

	abstract clone(): this;
}
