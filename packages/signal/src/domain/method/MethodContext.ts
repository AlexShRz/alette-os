import { THttpMethod, validateHttpMethod } from "@alette/pulse";
import { RequestContextPart } from "../context/RequestContextPart";

export class MethodContext extends RequestContextPart<THttpMethod, {}> {
	constructor(method: THttpMethod = "GET") {
		super(method, {});
	}

	set(method: THttpMethod) {
		this.state = validateHttpMethod(method);
	}

	override toRecord() {
		return {
			method: this.state,
		};
	}

	clone() {
		return new MethodContext(this.state) as this;
	}
}
