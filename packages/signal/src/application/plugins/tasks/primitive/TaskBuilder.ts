import * as E from "effect/Effect";

export abstract class TaskBuilder<Result = void, Errors = never> {
	constructor(protected readonly task: E.Effect<Result, Errors, never>) {}

	abstract clone(): this;

	build() {
		return this.task;
	}
}
