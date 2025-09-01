import * as ManagedRuntime from "effect/ManagedRuntime";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";

export abstract class AbstractBlueprintBuilder<R, ER> {
	protected defaultMiddlewareFactories: IMiddlewareSupplierFn<
		any,
		any,
		any,
		any
	>[] = [];
	protected blueprintRuntime: ManagedRuntime.ManagedRuntime<R, ER> | null =
		null;

	protected assertRuntimeProvided(): asserts this is {
		blueprintRuntime: ManagedRuntime.ManagedRuntime<R, ER>;
	} {
		if (!this.blueprintRuntime) {
			throw new Error(
				"[Blueprint Builder] - runtime for request execution was not provided.",
			);
		}
	}

	/**
	 * Non typed version of "use", used for actually storing
	 * middleware.
	 * */
	protected _use(
		...middlewareFactories: typeof this.defaultMiddlewareFactories
	): this {
		this.defaultMiddlewareFactories = [
			...this.defaultMiddlewareFactories,
			...middlewareFactories,
		];
		return this;
	}
}
