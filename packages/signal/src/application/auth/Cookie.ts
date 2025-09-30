import { ISchema } from "@alette/pulse";
import { AuthEntityCredentialConfig, CookieConfig } from "../../domain";
import { TAuthEntityCredentialSupplier } from "../../domain/auth/AuthTypes";
import { ICookieSupplier } from "../../domain/auth/cookies/CookieTypes";
import { IAuthEntityChangeSubscriber } from "../../domain/auth/services/AuthEntitySubscribers";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";
import {
	createCookie,
	forceRefreshCookie,
	invalidateCookie,
	refreshCookie,
	setCookieCredentials,
	setCookieSupplier,
	subscribeToCookieUpdates,
	unsubscribeFromCookieUpdates,
} from "../tasks";
import { forCookieValidity } from "../tasks";

type TCookieCredentialSupplier<Credentials = unknown> = (
	...params: Parameters<TAuthEntityCredentialSupplier>
) => Credentials | Promise<Credentials>;

export type TCookieCredentials<Credentials = unknown> =
	| TCookieCredentialSupplier<Credentials>
	| Credentials;

export class Cookie<Credentials = unknown> {
	protected credentialSupplier: TAuthEntityCredentialSupplier<Credentials> | null =
		null;

	constructor(
		protected scheduler: PluginTaskScheduler,
		protected config: {
			id: string;
			credentialSchema: ISchema<unknown, Credentials>;
			cookieSupplier: ICookieSupplier<Credentials>;
			refreshInterval: TRecognizedApiDuration | null;
		},
	) {
		const { id, cookieSupplier, credentialSchema, refreshInterval } =
			this.config;

		createCookie(
			new CookieConfig({
				id,
				supplier: cookieSupplier,
				refreshEvery: refreshInterval,
				credentials: new AuthEntityCredentialConfig({
					id,
					credentialSchema,
				}),
			}),
		).sendTo(this.scheduler);
	}

	async isValid() {
		const status = await forCookieValidity(this.config.id).toPromise(
			this.scheduler,
		);
		return status === "valid";
	}

	getId() {
		return this.config.id;
	}

	using(credentialsOrSupplier: TCookieCredentials<Credentials>) {
		this.credentialSupplier =
			typeof credentialsOrSupplier === "function"
				? async (...args) =>
						await (
							credentialsOrSupplier as TCookieCredentialSupplier<Credentials>
						)(...args)
				: async () => credentialsOrSupplier;

		setCookieCredentials(this.config.id, this.credentialSupplier as any).sendTo(
			this.scheduler,
		);
		return this;
	}

	load() {
		return refreshCookie(this.config.id).toPromise(this.scheduler);
	}

	from(cookieSupplier: ICookieSupplier<Credentials>) {
		this.config.cookieSupplier = cookieSupplier;
		setCookieSupplier(this.config.id, cookieSupplier).sendTo(this.scheduler);
		return this;
	}

	refresh() {
		forceRefreshCookie(this.config.id).sendTo(this.scheduler);
		return this;
	}

	invalidate() {
		invalidateCookie(this.config.id).sendTo(this.scheduler);
		return this;
	}

	onStatus(listener: IAuthEntityChangeSubscriber) {
		const { id } = this.config;
		subscribeToCookieUpdates(id, listener).sendTo(this.scheduler);

		return () => {
			unsubscribeFromCookieUpdates(id, listener).sendTo(this.scheduler);
		};
	}
}
