import { IHeaders, ISchema } from "@alette/pulse";
import { AuthEntityCredentialConfig, TokenConfig } from "../../domain";
import { TAuthEntityCredentialSupplier } from "../../domain/auth/AuthTypes";
import { IAuthEntityChangeSubscriber } from "../../domain/auth/services/AuthEntitySubscribers";
import {
	ITokenHeaderConverter,
	ITokenSupplier,
} from "../../domain/auth/tokens/TokenTypes";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";
import {
	createToken,
	forceRefreshToken,
	invalidateToken,
	setTokenCredentials,
	setTokenSupplier,
	subscribeToTokenUpdates,
	unsubscribeFromTokenUpdates,
} from "../tasks";
import { forToken, forTokenHeaders, forTokenValidity } from "../tasks";

type TTokenCredentialSupplier<Credentials = unknown> = (
	...params: Parameters<TAuthEntityCredentialSupplier<Credentials>>
) => Credentials | Promise<Credentials>;

export type TTokenCredentials<Credentials = unknown> =
	| TTokenCredentialSupplier<Credentials>
	| Credentials;

export class Token<
	Credentials = unknown,
	ProvidedHeaders extends IHeaders = IHeaders,
> {
	protected credentialSupplier: TAuthEntityCredentialSupplier<Credentials> | null =
		null;

	constructor(
		protected scheduler: PluginTaskScheduler,
		protected config: {
			id: string;
			credentialSchema: ISchema<unknown, Credentials>;
			tokenSupplier: ITokenSupplier<Credentials>;
			refreshInterval: TRecognizedApiDuration | null;
			tokenToHeaderConverter: ITokenHeaderConverter<ProvidedHeaders>;
		},
	) {
		const {
			id,
			tokenSupplier,
			tokenToHeaderConverter,
			credentialSchema,
			refreshInterval,
		} = this.config;

		createToken(
			new TokenConfig({
				id,
				headerConverter: tokenToHeaderConverter,
				supplier: tokenSupplier,
				refreshEvery: refreshInterval,
				credentials: new AuthEntityCredentialConfig({
					id,
					credentialSchema,
				}),
			}),
		).sendTo(this.scheduler);
	}

	async isValid() {
		const status = await forTokenValidity(this.config.id).toPromise(
			this.scheduler,
		);
		return status === "valid";
	}

	getId() {
		return this.config.id;
	}

	get() {
		return forToken(this.config.id).toPromise(this.scheduler);
	}

	using(credentialsOrSupplier: TTokenCredentials<Credentials>) {
		this.credentialSupplier =
			typeof credentialsOrSupplier === "function"
				? async (...args) =>
						await (
							credentialsOrSupplier as TTokenCredentialSupplier<Credentials>
						)(...args)
				: async () => credentialsOrSupplier;

		setTokenCredentials(this.config.id, this.credentialSupplier as any).sendTo(
			this.scheduler,
		);
		return this;
	}

	from(tokenSupplier: ITokenSupplier<Credentials>) {
		this.config.tokenSupplier = tokenSupplier;
		setTokenSupplier(this.config.id, tokenSupplier).sendTo(this.scheduler);
		return this;
	}

	refresh() {
		forceRefreshToken(this.config.id).sendTo(this.scheduler);
		return this;
	}

	refreshAndGet() {
		forceRefreshToken(this.config.id).sendTo(this.scheduler);
		return this.get();
	}

	invalidate() {
		invalidateToken(this.config.id).sendTo(this.scheduler);
		return this;
	}

	toHeaders() {
		return forTokenHeaders<ProvidedHeaders>(this.config.id).toPromise(
			this.scheduler,
		);
	}

	onStatus(listener: IAuthEntityChangeSubscriber) {
		const { id } = this.config;
		subscribeToTokenUpdates(id, listener).sendTo(this.scheduler);

		return () => {
			unsubscribeFromTokenUpdates(id, listener).sendTo(this.scheduler);
		};
	}
}
