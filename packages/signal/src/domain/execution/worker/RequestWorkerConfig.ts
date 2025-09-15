import * as Equal from "effect/Equal";
import * as Hash from "effect/Hash";
import { RequestMiddleware } from "../../middleware/RequestMiddleware";
import { TRequestMode } from "../services/RequestMode";

export class RequestWorkerConfig implements Equal.Equal {
	constructor(
		protected id: string,
		protected requestMode: TRequestMode = "oneShot",
		protected middleware: RequestMiddleware[] = [],
	) {}

	getId() {
		return this.id;
	}

	getRequestMode() {
		return this.requestMode;
	}

	getMiddleware() {
		return this.middleware;
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		if (that instanceof RequestWorkerConfig) {
			return this.id === that.id;
		}

		return false;
	}

	[Hash.symbol](): number {
		return Hash.hash(this.id);
	}
}
