import { IHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { BodyUpdateOperationArgs } from "./BodyUpdateOperationArgs";

export const setBody = (headers: IHeaders = {}) =>
	E.gen(function* () {
		const { bodyContext, body, headerContext } = yield* BodyUpdateOperationArgs;
		bodyContext.getAdapter().setBody(body);

		if (Object.keys(headers).length) {
			yield* SynchronizedRef.getAndUpdateEffect(
				headerContext,
				(requestHeaders) =>
					E.gen(function* () {
						requestHeaders.addSystemInjectedHeaders(headers);
						return requestHeaders;
					}),
			);
		}

		return bodyContext;
	});
