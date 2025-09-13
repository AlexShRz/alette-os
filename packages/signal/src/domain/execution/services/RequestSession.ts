import * as E from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { TRequestMode } from "../worker/RequestWorkerConfig";

export class RequestSession extends E.Service<RequestSession>()(
	"RequestSession",
	{
		scoped: E.fn(function* ({
			initialRequestId,
			requestMode,
		}: {
			initialRequestId: string;
			requestMode: TRequestMode;
		}) {
			const requestId = yield* SubscriptionRef.make(initialRequestId);

			return {
				isOneShotMode() {
					return requestMode === "oneShot";
				},

				getRequestId() {
					return requestId.get;
				},

				getRequestIdChanges() {
					return requestId.changes;
				},

				getMode() {
					return requestMode;
				},

				setRequestId(newId: string) {
					return SubscriptionRef.getAndUpdate(requestId, (id) => {
						if (id === newId) {
							return id;
						}

						return newId;
					});
				},
			};
		}),
	},
) {}
