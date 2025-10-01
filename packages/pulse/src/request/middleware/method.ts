import * as E from "effect/Effect";
import { THttpMethod } from "../../method";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const method =
	(httpMethod: THttpMethod): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				data.update({
					method: httpMethod,
				});
			}),
		);
