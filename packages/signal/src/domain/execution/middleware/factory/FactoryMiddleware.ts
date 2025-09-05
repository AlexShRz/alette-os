import { Listener } from "@alette/event-sourcing";
import * as E from "effect/Effect";
import { RunRequest } from "../../events/RunRequest";
import { IRequestRunner } from "./FactoryMiddlewareFactory";

export class FactoryMiddleware extends Listener.as("FactoryMiddleware")(
	(runner: IRequestRunner) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof RunRequest) {
								yield* event.complete();
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
