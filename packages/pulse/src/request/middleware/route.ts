import * as E from "effect/Effect";
import { UrlBuilder } from "../../url";
import { IRequestMiddleware } from "../RequestTypes";
import { RequestData } from "../services/RequestData";

export const route =
	(url: UrlBuilder): IRequestMiddleware =>
	(request) =>
		request.prependOperation(
			E.gen(function* () {
				const data = yield* RequestData;
				data.update({
					route: url,
				});
			}),
		);
