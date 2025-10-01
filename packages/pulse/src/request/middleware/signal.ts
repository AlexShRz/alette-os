import * as E from "effect/Effect";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const signal =
	(abortSignal: AbortSignal): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				data.update({
					signal: abortSignal,
				});
			}),
		);
