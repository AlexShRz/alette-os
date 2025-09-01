import * as E from "effect/Effect";
import { RequestSession } from "./RequestSession";

export class RequestMeta extends E.Service<RequestMeta>()("RequestMeta", {
	scoped: E.gen(function* () {
		const session = yield* RequestSession;

		return {};
	}),
}) {}
