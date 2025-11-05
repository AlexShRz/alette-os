import * as E from "effect/Effect";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewarePriority } from "../../../middleware/constants/MiddlewarePriority";
import { UploadProgressReceived } from "../../events/UploadProgressReceived";
import { TTapUploadProgressArgs } from "./TapUploadProgress";

export class TapUploadProgressMiddleware extends Middleware(
	"TapUploadProgressMiddleware",
	{
		priority: MiddlewarePriority.Mapping,
	},
)(
	(tapUploadProgressFn: TTapUploadProgressArgs) =>
		({ parent, context }) =>
			E.gen(function* () {
				const scope = yield* E.scope;
				const sessionContext = yield* E.serviceOptional(RequestSessionContext);

				const runUploadProgressTap = (event: UploadProgressReceived) =>
					E.gen(function* () {
						const requestContext = yield* sessionContext.getSnapshot();
						const progressData = event.getProgressData();

						yield* E.promise(() => {
							const configured = async () =>
								await tapUploadProgressFn(progressData, requestContext);
							return configured();
						});
					}).pipe(E.forkIn(scope));

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (!(event instanceof UploadProgressReceived)) {
								return yield* context.next(event);
							}

							yield* runUploadProgressTap(event);
							return yield* context.next(event);
						});
					},
				};
			}),
) {}
