import { IQueryParams } from "@alette/pulse";
import * as E from "effect/Effect";
import { RequestSessionContext } from "../../../execution/services/RequestSessionContext";
import { UrlContext } from "./UrlContext";

export const getOrCreateUrlContext = <
	Params extends IQueryParams = IQueryParams,
>() =>
	E.gen(function* () {
		const context = yield* E.serviceOptional(RequestSessionContext);
		return yield* context.getOrCreate(
			"url",
			E.succeed(new UrlContext<Params>()),
		);
	}).pipe(E.orDie);
