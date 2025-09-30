import * as Duration from "effect/Duration";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { TRecognizedApiDuration } from "../../../shared";

export class AuthEntityScheduledRefresh extends E.Service<AuthEntityScheduledRefresh>()(
	"AuthEntityScheduledRefresh",
	{
		scoped: E.gen(function* () {
			const runtime = yield* E.runtime();
			const runFork = Runtime.runFork(runtime);

			let refreshIntervalId: number | null = null;

			const clearSchedule = () => {
				if (refreshIntervalId) {
					clearInterval(refreshIntervalId);
				}
			};

			yield* E.addFinalizer(() => E.sync(() => clearSchedule()));

			return {
				refreshPeriodically(
					interval: TRecognizedApiDuration | null,
					repeatedTask: E.Effect<void>,
				) {
					if (!interval) {
						return;
					}

					clearSchedule();
					const id = setInterval(
						() => {
							runFork(repeatedTask);
						},
						Duration.toMillis(Duration.decode(interval)),
					);
					refreshIntervalId = id as unknown as number;
				},
			};
		}),
	},
) {}
