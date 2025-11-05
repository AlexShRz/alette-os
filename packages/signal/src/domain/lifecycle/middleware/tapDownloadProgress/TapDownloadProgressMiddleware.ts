import * as E from "effect/Effect";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { DownloadProgressReceived } from "../../events/DownloadProgressReceived";
import { TTapDownloadProgressArgs } from "./TapDownloadProgress";

export class TapDownloadProgressMiddleware extends Middleware(
	"TapDownloadProgressMiddleware",
	{
		priority: MiddlewarePriority.Mapping,
	},
)(
	(tapDownloadProgressFn: TTapDownloadProgressArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runDownloadProgressTap = (event: DownloadProgressReceived) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();
						const progressData = event.getProgressData();

						yield* E.promise(() => {
							const configured = async () =>
								await tapDownloadProgressFn(progressData, requestContext);
							return configured();
						});
					}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof DownloadProgressReceived)) {
								return yield* context.next(event);
							}

							yield* runDownloadProgressTap(event);
							return yield* context.next(event);
						});
					},
				};
			}),
) {}
