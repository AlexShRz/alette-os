import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { ArgumentContext } from "../../ArgumentContext";
import { argumentAdapter } from "../../adapter";
import { ArgumentAdapter } from "../../adapter/ArgumentAdapter";
import { TInputMiddlewareArgValue } from "./InputMiddlewareFactory";

export class InputMiddleware extends Middleware("InputMiddleware", {
	priority: MiddlewarePriority.Creational,
})(
	(argSchema: TInputMiddlewareArgValue) =>
		({ parent, context }) =>
			E.gen(function* () {
				const setUpArgs = (passedEvent: RunRequest) =>
					E.gen(function* () {
						const context = yield* E.serviceOptional(RequestSessionContext);

						const settingSupplier = passedEvent.getSettingSupplier();
						const obtainedSettings = settingSupplier();

						const argAdapter =
							argSchema instanceof ArgumentAdapter
								? argSchema
								: argumentAdapter().build();

						const extractedArgs = P.hasProperty(obtainedSettings, "args")
							? obtainedSettings.args
							: null;

						const validatedArgs = yield* E.orDie(
							E.succeed(argAdapter.from(extractedArgs)),
						);

						yield* context.getOrCreate(
							"args",
							E.succeed(new ArgumentContext(validatedArgs)),
						);
					}).pipe(E.orDie);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							event.executeLazy((operation, getSelf) =>
								operation.pipe(E.andThen(setUpArgs(getSelf()))),
							);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
