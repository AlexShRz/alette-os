import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { orPanic } from "../../../errors/utils/orPanic";
import { RequestWasMounted } from "../../../lifecycle/events/RequestWasMounted";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithRunOnMountCheck } from "../../events/envelope/WithRunOnMountCheck";
import { RequestMeta } from "../../services/RequestMeta";
import { RequestMode } from "../../services/RequestMode";
import { attachRequestId } from "../../utils/attachRequestId";
import { TRunOnMountMiddlewareArgs } from "./RunOnMountMiddlewareFactory";

export class RunOnMountMiddleware extends Middleware("RunOnMountMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(isEnabledFlagOrSupplier: TRunOnMountMiddlewareArgs = true) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const globalContext = yield* E.serviceOptional(GlobalContext);
				const meta = yield* E.serviceOptional(RequestMeta);
				const mountModeMeta = meta.getMountModeMeta();
				const runFork = Runtime.runFork(yield* E.runtime());

				const isEnabled = yield* E.promise(async () => {
					if (typeof isEnabledFlagOrSupplier !== "function") {
						return isEnabledFlagOrSupplier;
					}

					return isEnabledFlagOrSupplier({
						context: await globalContext.getAsPromise(),
					});
				}).pipe(orPanic);

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							/**
							 * If we are in the "oneShot" mode
							 * we need to ignore all mount checks
							 * */
							if (requestMode.isOneShot()) {
								/**
								 * If our event is wrapped in runOnMount check,
								 * remove this check and send the event downstream
								 * */
								const unwrappedEvent =
									event instanceof WithRunOnMountCheck ? event.peel() : event;
								return yield* context.next(unwrappedEvent);
							}

							/**
							 * If our event is not wrapped in runOnMount check,
							 * we cannot process it here.
							 * */
							if (!(event instanceof WithRunOnMountCheck)) {
								return yield* context.next(event);
							}

							/**
							 * Peel the envelope layer
							 * */
							const nextEvent = event.peel();
							const wasMounted = yield* mountModeMeta.wasRequestMounted();

							if (wasMounted) {
								return yield* E.zipRight(
									nextEvent.cancel(),
									context.next(nextEvent),
								);
							}

							yield* mountModeMeta.markRequestAsMounted();
							/**
							 * 1. Notify middleware about request mount
							 * 2. This should be executed only for mounted requests,
							 * not one shot ones.
							 * */
							runFork(
								context.sendToBus(
									yield* attachRequestId(new RequestWasMounted()),
								),
							);

							/**
							 * In disabled mode we do not run mounted requests,
							 * so we have to cancel it here.
							 * */
							if (!isEnabled) {
								return yield* E.zipRight(
									nextEvent.cancel(),
									context.next(nextEvent),
								);
							}

							return yield* context.next(nextEvent);
						});
					},
				};
			}),
) {}
