import * as E from "effect/Effect";
import { TaskBuilder } from "./TaskBuilder";

export class CommandTaskBuilder<Errors = never> extends TaskBuilder<
	void,
	Errors
> {
	constructor(factory: () => E.Effect<void, Errors, never>) {
		super(factory);
	}

	override clone() {
		return new CommandTaskBuilder(this.taskFactory) as this;
	}
}
