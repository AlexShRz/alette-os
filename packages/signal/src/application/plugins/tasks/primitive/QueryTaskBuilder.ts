import { TaskBuilder } from "./TaskBuilder";

export class QueryTaskBuilder<Result = any, Errors = never> extends TaskBuilder<
	Result,
	Errors
> {
	override clone() {
		return new QueryTaskBuilder(this.task) as this;
	}
}
