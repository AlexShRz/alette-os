import { v4 as uuid } from "uuid";
import { IRequestContext } from "../../domain/context/IRequestContext";
import {
	TRequestResponse,
	TRequestSettings,
} from "../../domain/context/typeUtils/RequestIOTypes";
import { IRequestSettingSupplier } from "../../domain/execution/services/RequestSessionContext";
import {
	IMiddlewareSupplier,
	IRuntimeMiddlewareSupplierFn,
} from "../../domain/middleware/IMiddlewareSupplier";
import { RequestMiddleware } from "../../domain/middleware/RequestMiddleware";
import { IAnyRequestSpecification } from "../../domain/specification";
import { RequestWatcher } from "../../domain/watchers/RequestWatcher";
import { Callable } from "../../shared/Callable";
import { ApiPlugin } from "../plugins/ApiPlugin";

export type TAnyMiddlewareInjector = RequestMiddleware | RequestWatcher;

export abstract class ApiRequest<
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends IAnyRequestSpecification = IAnyRequestSpecification,
> extends Callable<
	(args?: TRequestSettings<Context>) => Promise<TRequestResponse<Context>>
> {
	/**
	 * IMPORTANT:
	 * See blueprint key tests.
	 * */
	protected blueprintKey = uuid();

	protected abstract plugin: ApiPlugin;
	protected abstract defaultMiddleware: RequestMiddleware[];

	/**
	 * 1. Helps us figure out where to route the request
	 * 2. Each request is routed to a specified request thread
	 * using its worker id.
	 * */
	protected requestThreadId = uuid();
	/**
	 * Provides default request settings "filled from using(...)"
	 * */
	protected settingSupplier: IRequestSettingSupplier<Context> = () => ({});
	/**
	 * 1. Holds middleware and watchers.
	 * 2. Because we hold ONLY layers here, our middleware/watchers
	 * are lazy by default. They will be created only when we put
	 * them inside an event bus.
	 * */
	protected middlewareInjectors: TAnyMiddlewareInjector[] = [];

	getKey() {
		return this.blueprintKey;
	}

	getSettingSupplier() {
		return this.settingSupplier;
	}

	protected getAllMiddlewareInjectors() {
		return [...this.defaultMiddleware, ...this.middlewareInjectors];
	}

	protected mergeInjectorsAndCloneSelf(
		lazyMiddlewareSuppliers: IMiddlewareSupplier<any, any, any, any>[],
	) {
		/**
		 * 1. Here we need to CLONE the request WHILE
		 * changing our request thread id.
		 * 2. When we add any new middleware to the request,
		 * it means that we are creating a COMPLETELY NEW REQUEST.
		 * */
		const self = this.clone();
		/**
		 * Make sure to copy middleware AFTER cloning
		 * */
		self.middlewareInjectors = [
			...this.middlewareInjectors,
			...(lazyMiddlewareSuppliers as IRuntimeMiddlewareSupplierFn[]).map((fn) =>
				fn()(),
			),
		];
		return self;
	}

	/**
	 * 1. Use "Omit" here to prevent further middleware chaining (types only)
	 * 2. This prevents a situation where people decide to override something
	 * like output() that changes arg type entirely.
	 * */
	using(
		supplier: () => TRequestSettings<Context>,
	): Omit<this, "with" | "toFactory"> {
		/**
		 * Here we need to CLONE everything WITHOUT
		 * changing our request thread id.
		 * */
		const self = this.clone();
		self.settingSupplier = supplier;
		self.requestThreadId = this.requestThreadId;
		return self;
	}

	protected abstract _clone(): this;

	clone(): this {
		const self = this._clone();
		self.middlewareInjectors = [...this.middlewareInjectors];
		self.settingSupplier = this.settingSupplier;
		/**
		 * IMPORTANT - copy blueprint key without
		 * any changes.
		 * */
		self.blueprintKey = this.blueprintKey;
		return self;
	}

	abstract control(): any;
}
