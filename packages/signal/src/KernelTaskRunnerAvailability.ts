import * as E from "effect/Effect";

export class KernelTaskRunnerAvailability extends E.Service<KernelTaskRunnerAvailability>()(
	"KernelTaskRunnerAvailability",
	{
		effect: E.gen(function* () {
			const canProcessPluginTasks = yield* E.makeLatch(true);
			return {
				canProcessPluginTasks,
			};
		}),
	},
) {}
