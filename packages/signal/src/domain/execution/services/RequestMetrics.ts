import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { RequestSession } from "./RequestSession";

export class RequestMetrics extends E.Service<RequestMetrics>()(
	"RequestMetrics",
	{
		scoped: E.gen(function* () {
			const session = yield* E.serviceOptional(RequestSession);
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

			yield* session.getRequestIdChanges().pipe(
				Stream.tap(
					E.fn(function* () {
						yield* SubscriptionRef.getAndUpdate(metrics, (prev) => ({
							...prev,
							attempt: 0,
						}));
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
			};
		}).pipe(E.orDie),
	},
) {}
