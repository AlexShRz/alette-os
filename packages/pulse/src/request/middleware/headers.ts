import * as E from "effect/Effect";
import { IHeaders } from "../../headers";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const headers =
	(providedHeaders: IHeaders): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				data.update({
					headers: providedHeaders,
				});
			}),
		);
