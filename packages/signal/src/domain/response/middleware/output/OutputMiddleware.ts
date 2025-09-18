import * as E from "effect/Effect";
import { orPanic } from "../../../errors/utils/orPanic";
import { ApplyRequestState } from "../../../execution/events/request/ApplyRequestState";
import { RequestState } from "../../../execution/events/request/RequestState";
import { RequestMeta } from "../../../execution/services/RequestMeta";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { responseAdapter } from "../../adapter";
import { ResponseAdapter } from "../../adapter/ResponseAdapter";
import { TOutputMiddlewareArgs } from "./OutputMiddlewareFactory";

export class OutputMiddleware extends Middleware("OutputMiddleware", {
	priority: MiddlewarePriority.Creation,
})(
	(schemaOrAdapter: TOutputMiddlewareArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const meta = yield* E.serviceOptional(RequestMeta);
				const adapters = meta.getValueAdapterConfig();

				/**
				 * Set response adapter, so every middleware is able
				 * to access it
				 * */
				adapters.setAdapter(
					schemaOrAdapter instanceof ResponseAdapter
						? schemaOrAdapter
						: responseAdapter().schema(schemaOrAdapter).build(),
				);

				return {
					...parent,
					send(event) {
						return E.gen(function* () {
							if (
								!(event instanceof ApplyRequestState) ||
								!RequestState.isSuccess(event)
							) {
								return yield* context.next(event);
							}

							const { data } = event.getState();

							/**
							 * Validate provided success value
							 * */
							const value = data.unsafeGet();
							const responseAdapter = adapters.getAdapter();
							yield* E.sync(() => responseAdapter.from(value)).pipe(orPanic);

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
