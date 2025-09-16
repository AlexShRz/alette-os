import * as E from "effect/Effect";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { WithRunOnMountCheck } from "../../events/envelope/WithRunOnMountCheck";
import { RequestMeta } from "../../services/RequestMeta";
import { RequestMode } from "../../services/RequestMode";

export class RunOnMountMiddleware extends Middleware("RunOnMountMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(isEnabled = true) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const meta = yield* E.serviceOptional(RequestMeta);
				const mountModeMeta = meta.getMountModeMeta();

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
