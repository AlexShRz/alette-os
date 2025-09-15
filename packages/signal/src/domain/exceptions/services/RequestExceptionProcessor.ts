import { FatalApiException } from "@alette/pulse";
import * as E from "effect/Effect";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";

export class RequestExceptionProcessor extends E.Service<RequestExceptionProcessor>()(
	"RequestExceptionProcessor",
	{
		scoped: E.gen(function* () {
			const fatalErrorBroadcaster =
				yield* PubSub.unbounded<FatalApiException>();

			return {
				failWithFatal(error: FatalApiException) {
					return fatalErrorBroadcaster.publish(error);
				},

				takeFatal() {
					return Stream.fromPubSub(fatalErrorBroadcaster);
				},
			};
		}),
	},
) {}
