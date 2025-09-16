import { RequestSpecification } from "@alette/pulse";
import { IRequestContext } from "../../domain/context/IRequestContext";
import { TRequestArguments } from "../../domain/context/typeUtils/RequestIOTypes";
import { TRequestMode } from "../../domain/execution/services/RequestMode";
import { IMiddlewareSupplierFn } from "../../domain/middleware/IMiddlewareSupplierFn";
import { ApiRequest } from "../blueprint/ApiRequest";
import { IOneShotRequestWithMiddleware } from "./IOneShotRequestWithMiddleware";
import { OneShotRequestController } from "./controller/OneShotRequestController";

export class OneShotRequest<
		PrevContext extends IRequestContext = IRequestContext,
		Context extends IRequestContext = IRequestContext,
		RequestSpec extends RequestSpecification = RequestSpecification,
	>
	extends ApiRequest<PrevContext, Context, RequestSpec>
	implements IOneShotRequestWithMiddleware<Context, RequestSpec>
{
	protected createController(mode: TRequestMode) {
		return new OneShotRequestController<Context>(this.plugin, {
			threadId: this.requestThreadId,
			plugin: this.plugin,
			requestMode: mode,
			middlewareInjectors: this.getAllMiddlewareInjectors(),
		}).setSettingSupplier(this.settingSupplier);
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
		return new OneShotRequest(this.plugin, [...this.defaultMiddleware]) as this;
	}

	async execute(args: TRequestArguments<Context> = {}) {
		const controller = this.createController("oneShot");
		const { execute } = controller.getHandlers();
		execute(args);

		return new Promise((resolve, reject) => {
			const unsubscribe = controller.subscribe(
				({ isSuccess, isError, error, data }) => {
					if (isSuccess || isError) {
						unsubscribe();
					}

					if (isSuccess) {
						resolve(data);
						return;
					}

					if (isError) {
						reject(error);
						return;
					}
				},
			);
		}).finally(() => {
			controller.dispose();
		});
	}

	mount() {
		const controller = this.createController("subscription");
		controller.reload();
		return {
			getState: controller.getState.bind(controller),
			reload: controller.reload.bind(controller),
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
	 * 1. For UI framework integrations ONLY
	 * 2. Low level version of "mount"
	 * */
	control() {
		return this.createController("subscription");
	}
}
