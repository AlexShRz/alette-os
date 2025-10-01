import { IRequestContext } from "../../../domain/context/IRequestContext";
import { ReloadableMiddlewareFactory } from "../../../domain/execution/middleware/reloadable/ReloadableMiddlewareFactory";
import { RunOnMountMiddlewareFactory } from "../../../domain/execution/middleware/runOnMount/RunOnMountMiddlewareFactory";
import { IMiddlewareSupplierFn } from "../../../domain/middleware/IMiddlewareSupplierFn";
import { RequestMiddleware } from "../../../domain/middleware/RequestMiddleware";
import { IAnyRequestSpecification } from "../../../domain/specification";
import { AbstractBlueprintBuilder } from "../../blueprint/AbstractBlueprintBuilder";
import { ApiPlugin } from "../../plugins/ApiPlugin";
import { OneShotRequest } from "../OneShotRequest";
import { IOneShotRequestBlueprintWithMiddleware } from "./IOneShotRequestBlueprintWithMiddleware";

export class OneShotRequestBlueprint<
		PContext extends IRequestContext,
		Context extends IRequestContext,
		RequestSpec extends IAnyRequestSpecification,
	>
	extends AbstractBlueprintBuilder
	implements IOneShotRequestBlueprintWithMiddleware<Context, RequestSpec>
{
	protected savedSpecs: RequestSpec | null = null;

	specification<T extends IAnyRequestSpecification>(
		specs: T,
	): OneShotRequestBlueprint<PContext, Context, T> {
		this.savedSpecs = specs as any;
		return this as any;
	}

	belongsTo(pluginParent: ApiPlugin) {
		this.plugin = pluginParent;
		return this;
	}

	protected assertSpecProvided(): asserts this is { savedSpecs: RequestSpec } {
		if (!this.savedSpecs) {
			throw new Error(
				"[RequestBlueprintBuilder] - specification for the request was not provided.",
			);
		}
	}

	protected assertDefaultMiddlewareProvided(middleware: RequestMiddleware[]) {
		if (!middleware.some((m) => m instanceof RunOnMountMiddlewareFactory)) {
			this.throwMiddlewareRequiredError("runOnMount");
		}

		if (!middleware.some((m) => m instanceof ReloadableMiddlewareFactory)) {
			this.throwMiddlewareRequiredError("reloadable");
		}
	}

	use: IOneShotRequestBlueprintWithMiddleware<Context, RequestSpec>["use"] = (
		...middlewareFns: IMiddlewareSupplierFn<any, any, any, any>[]
	) => {
		this._use(...middlewareFns);
		return this as any;
	};

	build() {
		this.assertSpecProvided();
		this.assertRuntimeProvided();
		const initializedMiddleware = this.buildMiddleware();
		this.assertDefaultMiddlewareProvided(initializedMiddleware);

		return new OneShotRequest<PContext, Context, RequestSpec>(
			this.plugin,
			initializedMiddleware,
		);
	}
}
