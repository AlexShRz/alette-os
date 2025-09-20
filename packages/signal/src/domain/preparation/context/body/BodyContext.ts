import { THttpBody, cloneBody, validateBody } from "@alette/pulse";
import { RequestContextPart } from "../../../context/RequestContextPart";

export class BodyContext extends RequestContextPart<THttpBody, {}> {
	constructor(body: THttpBody = {}) {
		super(body, {});
	}

	override getAdapter() {
		const self = this;

		return {
			setBody(body: THttpBody) {
				self.state = validateBody(body);
				return this;
			},
		};
	}

	override toRecord() {
		return {
			body: this.state,
		};
	}

	clone() {
		return new BodyContext(cloneBody(this.state)) as this;
	}
}
