import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestMetrics } from "./RequestMetrics";
import { RequestSessionContext } from "./RequestSessionContext";

export class RequestSession extends E.Service<RequestSession>()(
	"RequestSession",
	{
		dependencies: [RequestMetrics.Default],
		scoped: E.fn(function* (initialRequestId: string) {
			const requestId = yield* SynchronizedRef.make(initialRequestId);
			const context = yield* RequestSessionContext;
			const metrics = yield* RequestMetrics;

			const resetSessionData = E.gen(function* () {
				yield* context.reset();
				yield* metrics.reset();
			});

			return {
				getRequestId() {
					return requestId.get;
				},

				setRequestId(newId: string) {
					return SynchronizedRef.getAndUpdateEffect(requestId, (id) =>
						E.gen(function* () {
							if (id === newId) {
								return id;
							}

							yield* resetSessionData;
							return newId;
						}),
					);
				},
			};
		}),
	},
) {}
