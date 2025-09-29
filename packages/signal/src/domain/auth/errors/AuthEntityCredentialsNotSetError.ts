import { ApiError } from "@alette/pulse";
import { TAuthEntityType } from "../AuthTypes";

export class AuthEntityCredentialsNotSetError extends ApiError {
	constructor(protected type: TAuthEntityType) {
		super();
	}

	getEntityType() {
		return this.type;
	}

	cloneSelf() {
		return new AuthEntityCredentialsNotSetError(this.type);
	}
}
