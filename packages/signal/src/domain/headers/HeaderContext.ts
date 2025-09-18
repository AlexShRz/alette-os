import { IHeaders, validateHeaders } from "@alette/pulse";
import { RequestContextPart } from "../context/RequestContextPart";

export class HeaderContext extends RequestContextPart<IHeaders, {}> {
	constructor(headers: IHeaders = {}) {
		super(headers, {});
	}

	override getAdapter() {
		const self = this;

		return {
			setHeaders(headers: IHeaders) {
				self.state = validateHeaders(headers);
				return this;
			},
		};
	}

	override toRecord() {
		return {
			headers: this.state,
		};
	}

	clone() {
		return new HeaderContext({ ...this.state }) as this;
	}
}
