import { makeUrl } from "@alette/pulse";
import { Duration, Layer } from "effect";
import { vi } from "vitest";
import { activatePlugins, blueprint, coreApiPlugin } from "../../application";
import { customRequestSpec } from "../../application/corePlugin/custom";
import { CommandTaskBuilder } from "../../application/plugins/tasks/primitive/CommandTaskBuilder";
import { origin, reloadable, runOnMount } from "../../domain";
import { ApiClient, IApiRuntimeGetter } from "../../infrastructure/ApiClient";
import { TRecognizedApiDuration } from "../../shared/types";

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

	return {
		api,
		core,
		...core.use(),
		testUrl: makeUrl("https://example.com"),
		corePlugin: core.plugin,
		/**
		 * Make sure we use request types created for
		 * tests specifically, not our default plugin requests
		 * */
		custom: blueprint()
			.specification(customRequestSpec)
			.use(origin(), runOnMount(false), reloadable())
			.belongsTo(core.plugin)
			.build()
			.asFunction(),
	};
};
