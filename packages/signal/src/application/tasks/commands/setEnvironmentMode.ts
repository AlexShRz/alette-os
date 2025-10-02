import * as E from "effect/Effect";
import {
	EnvironmentMode,
	TApiEnvironmentMode,
} from "../../../domain/environment/EnvironmentMode";
import { orPanic } from "../../../domain/errors/utils/orPanic";
import { task } from "../../plugins/tasks/primitive/functions";

type TEnvFlagSupplier = () => boolean | Promise<boolean>;

const setMode = (env: TApiEnvironmentMode, flagSupplier?: TEnvFlagSupplier) =>
	task(
		E.gen(function* () {
			const environment = yield* E.serviceOptional(EnvironmentMode);

			const getCanSetEnvFlag: () => Promise<boolean> =
				typeof flagSupplier === "function"
					? async () => await flagSupplier()
					: async () => true;

			const canSetEnv = yield* E.promise(() => getCanSetEnvFlag());

			if (canSetEnv) {
				yield* environment.set(env);
			}
		}).pipe(orPanic),
	);

export const setTestMode = (supplier?: TEnvFlagSupplier) =>
	setMode("test", supplier);

export const setProductionMode = (supplier?: TEnvFlagSupplier) =>
	setMode("production", supplier);

export const setDebugMode = (supplier?: TEnvFlagSupplier) =>
	setMode("debug", supplier);
