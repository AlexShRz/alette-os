import { type, validateSchema } from "@alette/pulse";
import * as E from "effect/Effect";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { IInputMiddlewareArgSchema } from "./InputMiddlewareFactory";

export class InputMiddleware extends Middleware("InputMiddleware", {
	priority: MiddlewarePriority.Creational,
})(
	(argSchema: IInputMiddlewareArgSchema = type()) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							/**
							 * Get and validate provided args
							 * */
							const settingSupplier = event.getSettingSupplier();
							const obtainedSettings = settingSupplier();
							yield* E.orDie(
								E.succeed(validateSchema(argSchema, obtainedSettings)),
							);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
