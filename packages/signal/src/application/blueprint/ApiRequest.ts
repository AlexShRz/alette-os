import { IAnyRequestSpecification } from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestArguments } from "../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSessionSettingSupplier } from "../../domain/execution/services/RequestSessionContext";
import {
	IMiddlewareSupplierFn,
	IRuntimeMiddlewareSupplierFn,
} from "../../domain/middleware/IMiddlewareSupplierFn";
import { RequestMiddleware } from "../../domain/middleware/RequestMiddleware";
import { RequestWatcher } from "../../domain/watchers/RequestWatcher";

export type TAnyMiddlewareInjector = RequestMiddleware | RequestWatcher;

export abstract class ApiRequest<
	PrevContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends IAnyRequestSpecification = IAnyRequestSpecification,
	R = never,
	ER = never,
> {
	/**
	 * 1. Helps us figure out where to route the request
	 * 2. Each request is routed to a specified request worker
	 * using its worker id.
	 * */
	protected requestWorkerId = uuid();
	/**
	 * Provides default request settings "filled from using(...)"
	 * */
	protected settingSupplier: IRequestSessionSettingSupplier = () => ({});
	/**
	 * 1. Holds middleware and watchers.
	 * 2. Because we hold ONLY layers here, our middleware/watchers
	 * are lazy by default. They will be created only when we put
	 * them inside an event bus.
	 * */
	protected middlewareInjectors: TAnyMiddlewareInjector[] = [];

	constructor(
		protected runtime: ManagedRuntime.ManagedRuntime<R, ER>,
		protected defaultMiddleware: RequestMiddleware[],
	) {}

	protected getAllMiddlewareInjectors() {
		return [...this.defaultMiddleware, ...this.middlewareInjectors];
	}

	protected addMiddlewareInjectors(
		lazyMiddlewareSuppliers: IMiddlewareSupplierFn<any, any, any, any>[],
	) {
		this.middlewareInjectors = [
			...this.middlewareInjectors,
			...(lazyMiddlewareSuppliers as IRuntimeMiddlewareSupplierFn[]).map((fn) =>
				fn()(),
			),
		];
		/**
		 * 1. Here we need to CLONE the request WHILE
		 * changing our request worker id.
		 * 2. When we add any new middleware to the request,
		 * it means that we are creating a COMPLETELY NEW REQUEST.
		 * */
		return this.clone();
	}

	using(supplier: () => TRequestArguments<Context>[number]) {
		this.settingSupplier = supplier;
		/**
		 * Here we need to CLONE everything WITHOUT
		 * changing our request worker id.
		 * */
		const self = this.clone();
		self.requestWorkerId = this.requestWorkerId;
		return self;
	}

	protected abstract _clone(): this;

	clone(): this {
		const self = this._clone();
		self.middlewareInjectors = [...this.middlewareInjectors];
		self.settingSupplier = this.settingSupplier;
		return self;
	}
}
