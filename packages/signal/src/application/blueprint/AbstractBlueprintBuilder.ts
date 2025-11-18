import { TAnyMiddlewareFacade } from "../../domain/middleware/TAnyMiddlewareFacade";
import { ApiPlugin } from "../plugins/ApiPlugin";

export abstract class AbstractBlueprintBuilder {
	protected middlewareFactories: TAnyMiddlewareFacade<any, any, any, any>[] =
		[];
	protected plugin: ApiPlugin | null = null;

	protected throwMiddlewareRequiredError(middlewareName: string) {
		throw new Error(
			`[RequestBlueprintBuilder] - "${middlewareName}()" required default middleware was not not provided.`,
		);
	}

	protected assertRuntimeProvided(): asserts this is {
		plugin: ApiPlugin;
	} {
		if (!this.plugin) {
			throw new Error("[Blueprint Builder] - parent plugin was not provided.");
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
		return [...this.middlewareFactories].map((supplier) =>
			supplier.getMiddleware(),
		);
	}
}
