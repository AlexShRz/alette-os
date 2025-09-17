import * as Exit from "effect/Exit";
import * as Scope from "effect/Scope";
import { ApiPlugin } from "../../plugins/ApiPlugin";

export abstract class RequestControllerScope {
	protected scope: Scope.CloseableScope;

	constructor(protected plugin: ApiPlugin) {
		const runtime = this.plugin.getScheduler();
		this.scope = runtime.runSync(Scope.make());
	}

	get() {
		return this.scope;
	}

	close() {
		this.plugin.getScheduler().schedule(Scope.close(this.scope, Exit.void));
	}
}
