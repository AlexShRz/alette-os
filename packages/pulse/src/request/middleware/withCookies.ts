import * as E from "effect/Effect";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const withCookies =
	(allowed = false): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				if (allowed) {
					data.update({
						credentials: "include",
					});
				}
			}),
		);
