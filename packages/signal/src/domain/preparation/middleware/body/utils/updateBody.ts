import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { orPanic } from "../../../../errors/utils/orPanic";
import { RequestSessionContext } from "../../../../execution/services/RequestSessionContext";
import { BodyContext } from "../../../context/body/BodyContext";
import { getOrCreateHeaderContext } from "../../../context/headers/getOrCreateHeaderContext";
import { TBodySupplier } from "../BodyMiddlewareFactory";
import { BodyUpdateOperationArgs } from "./BodyUpdateOperationArgs";
import {
	setByteBody,
	setFormDataBody,
	setJsonBody,
	setTextBody,
	setUrlEncodedBody,
} from "./bodySetterVariations";

export const updateBody = (bodySupplier: TBodySupplier) =>
	E.gen(function* () {
		const requestContext = yield* E.serviceOptional(RequestSessionContext);
		const bodyContext = yield* requestContext.getOrCreate(
			"body",
			E.succeed(new BodyContext()),
		);
		const headerContext = yield* getOrCreateHeaderContext;
		const contextSnapshot = yield* requestContext.getSnapshot();
		/**
		 * For some reason we have to exclude Blob from
		 * our body union. Maybe this problem stems
		 * from incorrect tsconfig "lib" types? TODO: Research later
		 * */
		const getNewBody = P.isFunction(bodySupplier)
			? async () =>
					await (bodySupplier as Exclude<typeof bodySupplier, Blob>)(
						contextSnapshot,
					)
			: async () => bodySupplier;

		const newBody = yield* E.promise(() => getNewBody());

		yield* SynchronizedRef.getAndUpdateEffect(
			bodyContext,
			(currentBodyContext) =>
				E.gen(function* () {
					if (P.isString(newBody)) {
						return yield* setTextBody;
					}

					if (newBody instanceof FormData) {
						return yield* setFormDataBody;
					}

					if (
						newBody instanceof Blob ||
						newBody instanceof Uint8Array ||
						newBody instanceof ArrayBuffer
					) {
						return yield* setByteBody;
					}

					if (newBody instanceof URLSearchParams) {
						return yield* setUrlEncodedBody;
					}

					return yield* setJsonBody;
				}).pipe(
					E.provide(
						BodyUpdateOperationArgs.make({
							bodyContext: currentBodyContext,
							requestContext,
							body: newBody,
							headerContext,
						}),
					),
				),
		);
	}).pipe(orPanic);
