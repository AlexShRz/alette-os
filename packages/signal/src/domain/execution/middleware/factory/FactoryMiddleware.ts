import { EventBusListener } from "@alette/event-sourcing";
import { EventBusListenerTag, IEventBusListener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RunRequest } from "../../events/RunRequest";
import { RequestSessionContext } from "../../services/RequestSessionContext";
import { IRequestRunner } from "./factory/FactoryMiddlewareFacade";

export class FactoryMiddleware extends E.Service<EventBusListener>()(
	EventBusListenerTag,
	{
		scoped: (runner: IRequestRunner) =>
			E.gen(function* () {
				const requestContext = yield* E.serviceOptional(RequestSessionContext);
				const { base, context } = yield* EventBusListener.parent();

				return {
					...base,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof RunRequest) {
								yield* event.complete();
							}

							return yield* context.next(event);
						});
					},
				} satisfies IEventBusListener;
			}).pipe(E.orDie),
	},
) {}
