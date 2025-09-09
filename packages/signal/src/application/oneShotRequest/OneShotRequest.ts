import { RequestSpecification } from "@alette/pulse";
import { IRequestContext } from "../../domain/context/IRequestContext";
import {
	TRequestArguments,
	TRequestResponse,
} from "../../domain/context/typeUtils/RequestIOTypes";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import { ApiRequest } from "../blueprint/ApiRequest";
import { IOneShotRequestWithMiddleware } from "./IOneShotRequestWithMiddleware";
import { OneShotRequestController } from "./controller/OneShotRequestController";

export class OneShotRequest<
		PrevContext extends IRequestContext = IRequestContext,
		Context extends IRequestContext = IRequestContext,
		RequestSpec extends RequestSpecification = RequestSpecification,
		R = never,
		ER = never,
	>
	extends ApiRequest<PrevContext, Context, RequestSpec, R, ER>
	implements IOneShotRequestWithMiddleware<Context, RequestSpec>
{
	asFunction() {
		return this.with.bind(this);
	}

	with: IOneShotRequestWithMiddleware<Context, RequestSpec>["with"] = (
		...middlewareFns: IMiddlewareSupplierFn<any, any, any, any>[]
	) => {
		this.addMiddlewareInjectors(middlewareFns);
		return this as any;
	};

	protected _clone() {
		return new OneShotRequest(this.runtime, [
			...this.defaultMiddleware,
		]) as this;
	}

	async execute(
		...args: TRequestArguments<Context>
	): Promise<TRequestResponse<Context>> {
		const controller = new OneShotRequestController(this.runtime, {
			workerId: this.requestWorkerId,
			requestMode: "oneShot",
			middlewareInjectors: this.getAllMiddlewareInjectors(),
		});

		const { execute } = controller.getInitialState();
		execute(...args);
		return controller.awaitResult().finally(() => {
			controller.dispose();
		});
	}

	control() {
		return new OneShotRequestController(this.runtime, {
			workerId: this.requestWorkerId,
			requestMode: "subscription",
			middlewareInjectors: this.getAllMiddlewareInjectors(),
		});
	}
}
