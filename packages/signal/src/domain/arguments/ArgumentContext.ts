import * as P from "effect/Predicate";
import { RequestContextPart } from "../context/RequestContextPart";
import { ArgumentRef } from "./adapter/ArgumentRef";

export class ArgumentContext extends RequestContextPart<ArgumentRef, {}> {
	constructor(ref: ArgumentRef) {
		super(ref, {});
	}

	override fromRecord(record: Record<string, unknown>) {
		if (P.hasProperty(record, "args")) {
			this.state = this.state.set(record.args);
		}
	}

	toRecord() {
		return {
			args: this.state.get(),
		};
	}

	clone() {
		const self = new ArgumentContext(this.state.clone()) as this;
		self.settings = { ...this.settings };
		return self;
	}
}
