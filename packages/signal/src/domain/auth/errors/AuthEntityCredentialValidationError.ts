import { FatalApiError } from "@alette/pulse";
import { TAuthEntityType } from "../AuthTypes";

export class AuthEntityCredentialValidationError extends FatalApiError {
	constructor(
		protected type: TAuthEntityType,
		protected invalidCredentials: unknown,
	) {
		super();
	}

	getEntityType() {
		return this.type;
	}

	getInvalidCredentials() {
		return this.invalidCredentials;
	}
}
