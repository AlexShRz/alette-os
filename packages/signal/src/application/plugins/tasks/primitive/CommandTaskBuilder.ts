import { TaskBuilder } from "./TaskBuilder";

export class CommandTaskBuilder<Errors = never> extends TaskBuilder<
	void,
	Errors
> {
	override clone() {
		return new CommandTaskBuilder(this.task) as this;
	}
}
