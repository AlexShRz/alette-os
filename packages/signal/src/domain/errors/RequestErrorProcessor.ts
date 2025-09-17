import { FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";

export class RequestErrorProcessor extends E.Service<RequestErrorProcessor>()(
	"RequestErrorProcessor",
	{
		scoped: E.gen(function* () {
			const fatalErrorBroadcaster = yield* PubSub.unbounded<FatalApiError>();

			return {
				failWithFatal(error: FatalApiError) {
					return fatalErrorBroadcaster.publish(error);
				},

				takeFatal() {
					return Stream.fromPubSub(fatalErrorBroadcaster);
				},
			};
		}),
	},
) {}
