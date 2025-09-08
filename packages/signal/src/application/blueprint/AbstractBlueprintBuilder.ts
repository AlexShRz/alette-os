import * as ManagedRuntime from "effect/ManagedRuntime";
import {
	IMiddlewareSupplierFn,
	IRuntimeMiddlewareSupplierFn,
} from "../../domain/middleware/IMiddlewareSupplierFn";

export abstract class AbstractBlueprintBuilder<R, ER> {
	protected middlewareFactories: IMiddlewareSupplierFn<any, any, any, any>[] =
		[];
	protected blueprintRuntime: ManagedRuntime.ManagedRuntime<R, ER> | null =
		null;

	protected throwMiddlewareRequiredError(middlewareName: string) {
		throw new Error(
			`[RequestBlueprintBuilder] - "${middlewareName}()" required default middleware was not not provided.`,
		);
	}

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
	 * Untyped version of "use", used for actually storing
	 * middleware.
	 * */
	protected _use(
		...middlewareFactories: typeof this.middlewareFactories
	): this {
		this.middlewareFactories = [
			...this.middlewareFactories,
			...middlewareFactories,
		];
		return this;
	}

	protected buildMiddleware() {
		return (
			[...this.middlewareFactories] as IRuntimeMiddlewareSupplierFn[]
		).map((supplier) => supplier()());
	}
}
