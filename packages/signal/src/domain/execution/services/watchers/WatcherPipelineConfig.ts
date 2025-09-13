import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import { RequestController } from "../../../../application/blueprint/controller/RequestController";
import { RequestWatcher } from "../../../watchers/RequestWatcher";

export class WatcherPipelineConfig implements Equal.Equal {
	constructor(
		protected controller: RequestController<any, any>,
		protected watchers: RequestWatcher[],
	) {}

	is(id: string) {
		return this.getId() === id;
	}

	getId() {
		return this.controller.getId();
	}

	getEventReceiver() {
		return this.controller.getEventReceiver();
	}

	getWatchers() {
		return this.watchers;
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof WatcherPipelineConfig) {
			return this.getId() === that.getId();
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.getId());
	}
}
