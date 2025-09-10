import { RequestSpecification } from "@alette/pulse";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestArguments } from "../../domain/context/typeUtils/RequestIOTypes";
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
	protected createControllerForMountMode() {
		return new OneShotRequestController<Context, R, ER>(this.runtime, {
			threadId: this.requestThreadId,
			requestMode: "subscription",
			middlewareInjectors: this.getAllMiddlewareInjectors(),
		});
	}

	asFunction() {
		return this.with.bind(this);
	}

	with: IOneShotRequestWithMiddleware<Context, RequestSpec>["with"] = (
		...middlewareInjectors: IMiddlewareSupplierFn<any, any, any, any>[]
	) => {
		return this.mergeInjectorsAndCloneSelf(middlewareInjectors) as any;
	};

	protected _clone() {
		return new OneShotRequest(this.runtime, [
			...this.defaultMiddleware,
		]) as this;
	}

	async execute(...args: TRequestArguments<Context>) {
		const controller = new OneShotRequestController<Context, R, ER>(
			this.runtime,
			{
				threadId: this.requestThreadId,
				requestMode: "oneShot",
				middlewareInjectors: this.getAllMiddlewareInjectors(),
			},
		);

		const { execute } = controller.getHandlers();
		execute(...args);
		return controller.awaitResult().finally(() => {
			controller.dispose();
		});
	}

	mount() {
		const controller = this.createControllerForMountMode();
		return {
			when: (subscriber: Parameters<typeof controller.subscribe>[0]) => {
				const unsubscribe = controller.subscribe.bind(controller)(subscriber);
				/**
				 * 1. Dispatch current state snapshot to the subscriber.
				 * 2. This logic is for "mount" only, not "control". "control"
				 * is for UI only, and the logic is different there.
				 * */
				subscriber(controller.getState());
				return unsubscribe;
			},
			...controller.getHandlers(),
		};
	}

	/**
	 * @internal
	 * For UI only
	 * */
	control() {
		return this.createControllerForMountMode();
	}
}
