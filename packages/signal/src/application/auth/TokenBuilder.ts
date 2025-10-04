import { IHeaders, ISchema, as } from "@alette/pulse";
import { v4 as uuid } from "uuid";
import {
	ITokenHeaderConverter,
	ITokenSupplier,
} from "../../domain/auth/tokens/TokenTypes";
import { TRecognizedApiDuration } from "../../shared";
import { PluginTaskScheduler } from "../plugins/PluginTaskScheduler";
import { Token } from "./Token";

export class TokenBuilder<
	Credentials = unknown,
	ProvidedHeaders extends IHeaders = {
		Authorization: `Bearer ${string}`;
	},
> {
	protected id = uuid();
	protected tokenSupplier: ITokenSupplier<Credentials> | null = null;
	protected credentialSchema = as<Credentials>();
	protected tokenToHeaderConverter: ITokenHeaderConverter<ProvidedHeaders> =
		this.getDefaultHeaderConverter();
	protected refreshInterval: TRecognizedApiDuration | null = null;

	constructor(protected scheduler: PluginTaskScheduler) {}

	protected getDefaultHeaderConverter(): ITokenHeaderConverter<ProvidedHeaders> {
		return ({ token }) =>
			({
				Authorization: `Bearer ${token}`,
			}) as unknown as ProvidedHeaders;
	}

	credentials<NewCredentials>(schema: ISchema<unknown, NewCredentials>) {
		const self = this as unknown as TokenBuilder<
			NewCredentials,
			ProvidedHeaders
		>;
		self.credentialSchema = schema;
		return self;
	}

	from(tokenSupplier: ITokenSupplier<Credentials>) {
		this.tokenSupplier = tokenSupplier;
		return this;
	}

	whenConvertedToHeaders<NewHeaders extends IHeaders>(
		converter: ITokenHeaderConverter<NewHeaders>,
	) {
		const self = this as unknown as TokenBuilder<Credentials, NewHeaders>;
		self.tokenToHeaderConverter = converter;
		return self;
	}

	refreshEvery(interval: TRecognizedApiDuration) {
		this.refreshInterval = interval;
		return this;
	}

	protected assertConfigured(): asserts this is {
		tokenSupplier: ITokenSupplier<Credentials>;
	} {
		if (!this.tokenSupplier) {
			throw new Error('[TokenBuilder] - "from" token provider was not set.');
		}
	}

	build() {
		this.assertConfigured();
		return new Token<Credentials, ProvidedHeaders>(this.scheduler, {
			id: this.id,
			tokenSupplier: this.tokenSupplier,
			credentialSchema: this.credentialSchema,
			refreshInterval: this.refreshInterval,
			tokenToHeaderConverter: this.tokenToHeaderConverter,
		});
	}
}
