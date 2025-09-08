import { IAnyRequestSpecification } from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestArguments } from "../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSessionSettingSupplier } from "../../domain/execution/services/RequestSessionContext";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import { RequestMiddleware } from "../../domain/middleware/RequestMiddleware";

export abstract class ApiRequest<
	PrevContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends IAnyRequestSpecification = IAnyRequestSpecification,
	R = never,
	ER = never,
> {
	/**
	 * 1. Helps us figure out where to route the request
	 * */
	protected executionThreadId = uuid();
	/**
	 * Provides default request settings "filled from using(...)"
	 * */
	protected settingSupplier: IRequestSessionSettingSupplier = () => ({});
	protected middlewareSuppliers: ReturnType<
		IMiddlewareSupplierFn<any, any, any, any>
	>[] = [];

	constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected defaultMiddleware: RequestMiddleware[],
	) {}

	protected addMiddlewareSuppliers(
		lazyMiddlewareSuppliers: IMiddlewareSupplierFn<any, any, any, any>[],
	) {
		this.middlewareSuppliers = [
			...this.middlewareSuppliers,
			...lazyMiddlewareSuppliers.map((fn) => fn(this as any)),
		];
		/**
		 * 1. Here we need to CLONE the request WHILE
		 * changing our execution thread.
		 * 2. When we add any new middleware to the request,
		 * it means that we are creating a COMPLETELY NEW REQUEST.
		 * */
		return this.clone();
	}

	using(supplier: () => TRequestArguments<Context>[number]) {
		this.settingSupplier = supplier;
		/**
		 * Here we need to CLONE everything WITHOUT
		 * changing our execution thread.
		 * */
		const self = this.clone();
		self.executionThreadId = this.executionThreadId;
		return self;
	}

	protected abstract _clone(): this;

	clone(): this {
		const self = this._clone();
		self.middlewareSuppliers = [...this.middlewareSuppliers];
		self.settingSupplier = this.settingSupplier;
		return self;
	}
}
