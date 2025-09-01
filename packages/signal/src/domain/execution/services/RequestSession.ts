import * as E from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { TRequestMode } from "../RequestWorker";

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
				getRequestId() {
					return requestId.get;
				},

				getRequestIdChanges() {
					return requestId.changes;
				},

				getMode() {
					return requestMode;
				},
			};
		}),
	},
) {}
