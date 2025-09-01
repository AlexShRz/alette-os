import { EventInterceptorTag, TEventInterceptor } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RequestSessionEvent } from "../events/RequestSessionEvent";
import { RequestSession } from "./RequestSession";

export class RequestEventInterceptor extends E.Service<RequestEventInterceptor>()(
	EventInterceptorTag,
	{
		scoped: E.gen(function* () {
			const session = yield* RequestSession;

			return ((event) =>
				E.gen(function* () {
					if (!(event instanceof RequestSessionEvent)) {
						return event;
					}

					const currentRequestId = yield* session.getRequestId();

					/**
					 * Cancel "stray" events that might have been
					 * dispatched by request middleware, etc.
					 * */
					if (event.getRequestId() !== currentRequestId) {
						yield* event.cancel();
					}

					return event;
				})) satisfies TEventInterceptor;
		}),
	},
) {}
