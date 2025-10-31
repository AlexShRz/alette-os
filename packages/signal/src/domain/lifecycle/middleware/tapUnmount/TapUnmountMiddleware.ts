import * as E from "effect/Effect";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { orPanic } from "../../../errors/utils/orPanic";
import { RequestMode } from "../../../execution/services/RequestMode";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { TTapUnmountArgs } from "./TapUnmountMiddlewareFactory";

export class TapUnmountMiddleware extends Middleware("TapUnmountMiddleware", {
	priority: MiddlewarePriority.BeforeExecution,
})(
	(tapUnmount: TTapUnmountArgs) =>
		({ parent }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const isOneShotRequest = requestMode.isOneShot();

				/**
				 * Must not be triggered if our request
				 * was not mounted (one shot).
				 * */
				if (isOneShotRequest) {
					return parent;
				}

				const globalContext = yield* E.serviceOptional(GlobalContext);

				const runTapUnmount = E.promise(async () => {
					await tapUnmount({ context: await globalContext.getAsPromise() });
				}).pipe(orPanic);

				yield* E.addFinalizer(() => runTapUnmount);

				return parent;
			}),
) {}
