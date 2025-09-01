import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { RequestSession } from "./RequestSession";
import { WatcherPipeline } from "./WatcherPipeline";

export class RequestStateTimeline extends E.Service<RequestStateTimeline>()(
	"RequestStateTimeline",
	{
		scoped: E.gen(function* () {
			const scope = yield* E.scope;
			const session = yield* RequestSession;

			return {};
		}),
	},
) {}
