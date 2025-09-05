import { type } from "@alette/pulse";
import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import {
	IInputMiddlewareArgSchema,
	InputMiddlewareArgProvider,
} from "./InputMiddlewareFactory";

export class InputMiddleware extends Middleware("InputMiddleware")(
	(
		argSchema: IInputMiddlewareArgSchema = type(),
		defaultArgProvider: InputMiddlewareArgProvider,
	) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							return yield* context.next(event);
						});
					},
				};
			}),
) {}
