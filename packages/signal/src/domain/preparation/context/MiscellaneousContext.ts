import { RequestContextPart } from "../../context/RequestContextPart";

export interface IMiscellaneousRequestContext extends Record<string, unknown> {}

export class MiscellaneousContext extends RequestContextPart<
	IMiscellaneousRequestContext,
	{}
> {
	constructor(data: IMiscellaneousRequestContext = {}) {
		super(data, {});
	}

	addEntries(newData: IMiscellaneousRequestContext) {
		this.state = { ...this.state, ...newData };
		return this;
	}

	override toRecord() {
		return {
			...this.state,
		};
	}

	clone() {
		return new MiscellaneousContext({ ...this.state }) as this;
	}
}
