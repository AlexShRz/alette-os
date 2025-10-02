import * as E from "effect/Effect";
import { IGlobalContext } from "../../../domain";
import { GlobalContext } from "../../../domain/context/services/GlobalContext";
import { orPanic } from "../../../domain/errors/utils/orPanic";
import { task } from "../../plugins/tasks/primitive/functions";

export const setContext = (
	newContextOrSupplier:
		| IGlobalContext
		| (() => IGlobalContext | Promise<IGlobalContext>),
) =>
	task(
		E.gen(function* () {
			const context = yield* E.serviceOptional(GlobalContext);
			yield* context.transaction(
				E.gen(function* () {
					const getContext: () => Promise<IGlobalContext> =
						typeof newContextOrSupplier === "function"
							? async () => await newContextOrSupplier()
							: async () => newContextOrSupplier;

					const updatedContext = yield* E.promise(() => getContext());
					yield* context.set(updatedContext);
				}),
			);
		}).pipe(orPanic),
	);
