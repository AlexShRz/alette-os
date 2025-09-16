import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";

export class RequestMountModeMeta extends E.Service<RequestMountModeMeta>()(
	"RequestMountModeMeta",
	{
		scoped: E.gen(function* () {
			/**
			 * 1. We do not care about request id here.
			 * 2. In mount mode, the moment we process our first "run request"
			 * event, we mark the request middleware tree as fully "mounted".
			 * 3. After that, each request sent to the same tree
			 * is considered to be of the "refetch" type, not "mount".
			 * */
			const hasProcessedFirstMountRequest = yield* SynchronizedRef.make(false);

			return {
				wasRequestMounted() {
					return hasProcessedFirstMountRequest.get;
				},

				markRequestAsMounted() {
					return SynchronizedRef.set(hasProcessedFirstMountRequest, true);
				},
			};
		}),
	},
) {}
