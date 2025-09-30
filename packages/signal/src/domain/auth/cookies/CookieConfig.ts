import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import { TRecognizedApiDuration } from "../../../shared";
import { AuthEntityCredentialConfig } from "../services/AuthEntityCredentialConfig";
import { ICookieSupplier } from "./CookieTypes";

export interface ICookieConfig {
	id: string;
	supplier: ICookieSupplier;
	credentials: AuthEntityCredentialConfig;
	refreshEvery?: TRecognizedApiDuration | null;
}

export class CookieConfig implements Equal.Equal {
	constructor(protected config: ICookieConfig) {}

	getId() {
		return this.config.id;
	}

	getRefreshInterval() {
		return this.config.refreshEvery || null;
	}

	getCredentials() {
		return this.config.credentials;
	}

	getSupplier() {
		return this.config.supplier;
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof CookieConfig) {
			return this.config.id === that.getId();
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.config.id);
	}
}
