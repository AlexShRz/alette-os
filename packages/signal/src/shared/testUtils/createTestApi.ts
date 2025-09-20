import { Duration, Layer } from "effect";
import { vi } from "vitest";
import { activatePlugins, coreApiPlugin } from "../../application";
import { CommandTaskBuilder } from "../../application/plugins/tasks/primitive/CommandTaskBuilder";
import { ApiClient, IApiRuntimeGetter } from "../../infrastructure/ApiClient";
import { TRecognizedApiDuration } from "../types";

class TestApiWithTestContext extends ApiClient {
	getApiRuntime() {
		return this.runtime;
	}

	timeTravel(by: TRecognizedApiDuration) {
		return vi.advanceTimersByTimeAsync(Duration.toMillis(Duration.decode(by)));
		/**
		 * TODO: Move to effect utils the moment
		 * TestClock is fixed for nested runtimes
		 * */
		// return this.getApiRuntime().runPromise(
		// 	E.gen(function* () {
		// 		yield* TestClock.adjust(by);
		// 	}),
		// );
	}

	protected override getServices(getRuntime: IApiRuntimeGetter) {
		return Layer.mergeAll(Layer.empty, super.getServices(getRuntime));
	}
}

export const createTestApi = (...commands: CommandTaskBuilder[]) => {
	const core = coreApiPlugin();
	const api = new TestApiWithTestContext(
		activatePlugins(core.plugin),
		...commands,
	);

	return { api, corePlugin: core.plugin, ...core.use() };
};
