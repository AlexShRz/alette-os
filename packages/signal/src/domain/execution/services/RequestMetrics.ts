import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestSession } from "./RequestSession";

interface IRequestMetrics {
	attempt: number;
}

export class RequestMetrics extends E.Service<RequestMetrics>()(
	"RequestMetrics",
	{
		scoped: E.gen(function* () {
			const session = yield* E.serviceOptional(RequestSession);
			const metrics = yield* SynchronizedRef.make<IRequestMetrics>({
				attempt: 0,
			});

			yield* session.getRequestIdChanges().pipe(
				Stream.tap(
					E.fn(function* () {
						yield* SynchronizedRef.set(metrics, {
							attempt: 0,
						});
					}),
				),
				Stream.runDrain,
				E.forkScoped,
			);

			return {
				getAmountOfAttemptedExecutions() {
					return E.gen(function* () {
						const { attempt } = yield* metrics.get;
						return attempt;
					});
				},

				recordAttemptedExecution() {
					return SynchronizedRef.getAndUpdate(metrics, (m) => {
						return {
							...m,
							attempt: m.attempt + 1,
						};
					});
				},
			};
		}).pipe(E.orDie),
	},
) {}
