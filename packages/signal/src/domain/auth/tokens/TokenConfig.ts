import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import { TRecognizedApiDuration } from "../../../shared";
import { AuthEntityCredentialConfig } from "../AuthEntityCredentialConfig";
import { ITokenHeaderConverter, ITokenSupplier } from "./TokenTypes";

export interface ITokenConfig {
	id: string;
	supplier: ITokenSupplier;
	credentials: AuthEntityCredentialConfig;
	refreshEvery?: TRecognizedApiDuration | null;
	headerConverter?: ITokenHeaderConverter;
}

export class TokenConfig implements Equal.Equal {
	protected headerConverter: ITokenHeaderConverter =
		this.getDefaultHeaderConverter();

	constructor(protected config: ITokenConfig) {
		if (config.headerConverter) {
			this.headerConverter = config.headerConverter;
		}
	}

	getId() {
		return this.config.id;
	}

	getHeaderConverter() {
		return this.headerConverter;
	}

	getRefreshInterval() {
		return this.config.refreshEvery;
	}

	getCredentials() {
		return this.config.credentials;
	}

	getSupplier() {
		return this.config.supplier;
	}

	protected getDefaultHeaderConverter(): ITokenHeaderConverter {
		return ({ token }) => ({
			Authorization: `Bearer ${token}`,
		});
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof TokenConfig) {
			return this.config.id === that.getId();
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.config.id);
	}
}
