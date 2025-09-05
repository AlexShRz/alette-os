import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { RunRequest } from "../../events/request/RunRequest";
import { IRequestRunner } from "./FactoryMiddlewareFactory";

export class FactoryMiddleware extends Middleware("FactoryMiddleware")(
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
