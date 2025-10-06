import * as E from "effect/Effect";
import { GlobalContext } from "../../../context/services/GlobalContext";
import { RequestMode } from "../../../execution/services/RequestMode";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/MiddlewarePriority";
import { RequestWasMounted } from "../../events/RequestWasMounted";
import { TTapMountArgs } from "./TapMountMiddlewareFactory";

export class TapMountMiddleware extends Middleware("TapMountMiddleware", {
	priority: MiddlewarePriority.BeforeCreation,
})(
	(tapMountFn: TTapMountArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const requestMode = yield* E.serviceOptional(RequestMode);
				const isOneShotRequest = requestMode.isOneShot();

				if (isOneShotRequest) {
					return parent;
				}

				const scope = yield* E.scope;
				const globalContext = yield* E.serviceOptional(GlobalContext);

				const runTap = E.gen(function* () {
					yield* E.promise(
						async () =>
							await tapMountFn({ context: await globalContext.getAsPromise() }),
					);
				}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof RequestWasMounted) {
								yield* runTap;
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {}
