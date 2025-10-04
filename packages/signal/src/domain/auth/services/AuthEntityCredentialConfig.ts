import { ISchema, as } from "@alette/pulse";
import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";

export interface IAuthEntityCredentialData {
	id: string;
	credentialSchema?: ISchema;
}

export class AuthEntityCredentialConfig implements Equal.Equal {
	constructor(protected config: IAuthEntityCredentialData) {}

	getId() {
		return this.config.id;
	}

	getSchema() {
		return this.config.credentialSchema || as<unknown>();
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof AuthEntityCredentialConfig) {
			return this.config.id === that.getId();
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.config.id);
	}
}
