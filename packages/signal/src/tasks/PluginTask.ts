import { TaskBuilder } from "./TaskBuilder.js";

/** @internal */
export class PluginTask<T extends TaskBuilder<any, any>> {
	constructor(
		protected config: {
			task: T;
			supervisor: string;
		},
	) {}

	getSupervisor() {
		return this.config.supervisor;
	}

	unwrap() {
		return this.config.task;
	}
}
