import * as E from "effect/Effect";
import { THttpBody } from "../../body";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const body =
	(payload: THttpBody): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				data.update({
					body: payload,
				});
			}),
		);
