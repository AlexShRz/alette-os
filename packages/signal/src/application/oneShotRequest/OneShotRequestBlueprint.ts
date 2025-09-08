import { IAnyRequestSpecification } from "@alette/pulse";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { ReloadableMiddlewareFactory } from "../../domain/execution/middleware/reloadable/ReloadableMiddlewareFactory";
import { RunOnMountMiddlewareFactory } from "../../domain/execution/middleware/runOnMount/RunOnMountMiddlewareFactory";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import { RequestMiddleware } from "../../domain/middleware/RequestMiddleware";
import { AbstractBlueprintBuilder } from "../blueprint/AbstractBlueprintBuilder";
import { IOneShotRequestBlueprintWithMiddleware } from "./IOneShotRequestBlueprintWithMiddleware";
import { OneShotRequest } from "./OneShotRequest";

export class OneShotRequestBlueprint<
		PContext extends IRequestContext,
		Context extends IRequestContext,
		RequestSpec extends IAnyRequestSpecification,
		/**
		 * Runtime types below
		 * */
		R,
		ER,
	>
	extends AbstractBlueprintBuilder<R, ER>
	implements IOneShotRequestBlueprintWithMiddleware<Context, RequestSpec, R, ER>
{
	protected savedSpecs: RequestSpec | null = null;

	specification<T extends IAnyRequestSpecification>(
		specs: T,
	): OneShotRequestBlueprint<PContext, Context, T, R, ER> {
		this.savedSpecs = specs as any;
		return this as any;
	}

	executor<NR, NER>(
		passedRuntime: ManagedRuntime.ManagedRuntime<NR, NER>,
	): OneShotRequestBlueprint<PContext, Context, RequestSpec, NR, NER> {
		this.blueprintRuntime = passedRuntime as any;
		return this as any;
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

	use: IOneShotRequestBlueprintWithMiddleware<
		Context,
		RequestSpec,
		R,
		ER
	>["use"] = (
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

		return new OneShotRequest<PContext, Context, RequestSpec, R, ER>(
			this.blueprintRuntime,
			initializedMiddleware,
		);
	}
}
