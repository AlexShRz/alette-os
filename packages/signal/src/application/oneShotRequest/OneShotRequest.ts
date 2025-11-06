import { IRequestContext } from "../../domain/context/IRequestContext";
import {
	TRequestResponse,
	TRequestSettings,
} from "../../domain/context/typeUtils/RequestIOTypes";
import { TRequestMode } from "../../domain/execution/services/RequestMode";
import { RequestMiddleware } from "../../domain/middleware/RequestMiddleware";
import { TAnyMiddlewareFacade } from "../../domain/middleware/TAnyMiddlewareFacade";
import { RequestSpecification } from "../../domain/specification";
import { ApiRequest } from "../blueprint/ApiRequest";
import { ApiPlugin } from "../plugins/ApiPlugin";
import { IOneShotRequestWithMiddleware } from "./IOneShotRequestWithMiddleware";
import { OneShotRequestController } from "./controller/OneShotRequestController";

export class OneShotRequest<
		Context extends IRequestContext = IRequestContext,
		RequestSpec extends RequestSpecification = RequestSpecification,
	>
	extends ApiRequest<Context, RequestSpec>
	implements IOneShotRequestWithMiddleware<Context, RequestSpec>
{
	constructor(
		protected plugin: ApiPlugin,
		protected defaultMiddleware: RequestMiddleware[],
	) {
		super(async (settings = {}) => {
			const controller = this.getController("oneShot");
			const { execute } = controller.getHandlers();
			execute(settings);

			return new Promise<TRequestResponse<Context>>((resolve, reject) => {
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
		});
	}

	protected getController(mode: TRequestMode) {
		return new OneShotRequestController<Context>(this.plugin, {
			threadId: this.requestThreadId,
			plugin: this.plugin,
			requestMode: mode,
			middlewareInjectors: this.getAllMiddlewareInjectors(),
		}).setSettingSupplier(this.settingSupplier);
	}

	toFactory() {
		return this.with.bind(this);
	}

	with: IOneShotRequestWithMiddleware<Context, RequestSpec>["with"] = (
		...middlewareInjectors: TAnyMiddlewareFacade<any, any, any, any>[]
	) => {
		return this.mergeInjectorsAndCloneSelf(middlewareInjectors) as any;
	};

	protected _clone() {
		return new OneShotRequest(this.plugin, [...this.defaultMiddleware]) as this;
	}

	/**
	 * @deprecated
	 * Will be removed in V1 - call request blueprints directly instead.
	 * Example:
	 * getPosts(...), not getPosts(...)
	 * */
	async execute(settings: TRequestSettings<Context> = {}) {
		return this(settings);
	}

	/**
	 * Runs the request in the background,
	 * returning nothing back to the callee.
	 * */
	spawn(args: TRequestSettings<Context> = {}) {
		this(args).catch((e) => e);
	}

	mount() {
		const controller = this.getController("subscription");
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
		return this.getController("subscription");
	}
}
