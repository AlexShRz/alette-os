import * as E from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";

export class RequestMetrics extends E.Service<RequestMetrics>()(
	"RequestMetrics",
	{
		scoped: E.gen(function* () {
			const metrics = yield* SubscriptionRef.make<{
				/**
				 * Same as attempts, we just do not
				 * reset it after request id changes.
				 * */
				attemptsAcrossRequests: number;
				attempt: number;
			}>({
				attemptsAcrossRequests: 0,
				attempt: 0,
			});

			return {
				getAmountOfAttemptedExecutions() {
					return E.gen(function* () {
						const { attempt } = yield* metrics.get;
						return attempt;
					});
				},

				getAmountOfAttemptsAcrossRequests() {
					return E.gen(function* () {
						const { attemptsAcrossRequests } = yield* metrics.get;
						return attemptsAcrossRequests;
					});
				},

				recordAttemptedExecution() {
					return SubscriptionRef.getAndUpdate(metrics, (m) => {
						return {
							...m,
							attemptsAcrossRequests: m.attemptsAcrossRequests + 1,
							attempt: m.attempt + 1,
						};
					});
				},

				reset() {
					return SubscriptionRef.getAndUpdate(metrics, (prev) => ({
						...prev,
						attempt: 0,
					}));
				},
			};
		}).pipe(E.orDie),
	},
) {}
