import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import { orPanic } from "../../../errors/utils/orPanic";
import { RunRequest } from "../../../execution/events/request/RunRequest";
import { RequestMeta } from "../../../execution/services/RequestMeta";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { argumentAdapter } from "../../context";
import { ArgumentContext } from "../../context/arguments/ArgumentContext";
import { ArgumentAdapter } from "../../context/arguments/adapter/ArgumentAdapter";
import { TInputMiddlewareArgValue } from "./InputMiddlewareFactory";

export class InputMiddleware extends Middleware("InputMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(argSchemaOrAdapter: TInputMiddlewareArgValue) =>
		({ parent, context }) =>
			E.gen(function* () {
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);
				const requestMeta = yield* E.serviceOptional(RequestMeta);

				const setUpArgAdapterContext = E.gen(function* () {
					const argAdapter = requestMeta.getArgumentAdapterConfig();

					argAdapter.setAdapter(
						argSchemaOrAdapter instanceof ArgumentAdapter
							? argSchemaOrAdapter
							: argumentAdapter().schema(argSchemaOrAdapter).build(),
					);
				});
				/**
				 * 1. Set up argument adapter context immediately, even before
				 * the request has been started.
				 * 2. Other middleware might need to access it, so it must
				 * be filled at start up.
				 * */
				yield* setUpArgAdapterContext;

				const fillRequestArgumentContext = (passedEvent: RunRequest) =>
					E.gen(function* () {
						const settingSupplier = passedEvent.getSettingSupplier();
						const obtainedSettings = settingSupplier();

						const argAdapter = requestMeta
							.getArgumentAdapterConfig()
							.getAdapter();

						const extractedArgs = P.hasProperty(obtainedSettings, "args")
							? obtainedSettings.args
							: null;

						const validatedArgsRef = argAdapter.from(extractedArgs);

						/**
						 * Argument context will be wiped on every request id
						 * change, so "getOrCreate" is ok here.
						 * */
						yield* sessionContext.getOrCreate(
							"args",
							E.succeed(new ArgumentContext(validatedArgsRef)),
						);
					}).pipe(orPanic);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof RunRequest)) {
								return yield* context.next(event);
							}

							event.executeLazy((operation, getSelf) =>
								operation.pipe(
									E.andThen(fillRequestArgumentContext(getSelf())),
								),
							);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
