import { RequestAbortedError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { AbortRequest } from "../../events/request/AbortRequest";
import { RequestMeta } from "../../services/RequestMeta";
import { attachRequestId } from "../../utils/attachRequestId";
import { TAbortedByArgs } from "./AbortedByMiddlewareFactory";

export class AbortedByMiddleware extends Middleware("AbortedByMiddleware", {
	priority: MiddlewarePriority.Interception,
})(
	(abortControllerOrSignal: TAbortedByArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const abortSignal =
					abortControllerOrSignal instanceof AbortController
						? abortControllerOrSignal.signal
						: abortControllerOrSignal;

				const meta = yield* E.serviceOptional(RequestMeta);
				const errorConfig = meta.getErrorConfig();
				/**
				 * Make sure the api can process abort errors.
				 * */
				errorConfig.addRecognizedErrors([RequestAbortedError]);

				const runFork = Runtime.runFork(yield* E.runtime());

				const subscriber = () => {
					runFork(
						E.gen(function* () {
							const event = yield* attachRequestId(new AbortRequest());
							yield* context.sendToBus(event);
						}),
					);
				};

				abortSignal.addEventListener("abort", subscriber);
				yield* E.addFinalizer(
					E.fn(function* () {
						abortSignal.removeEventListener("abort", subscriber);
					}),
				);

				return {
					...parent,
				};
			}),
) {}
