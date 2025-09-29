import * as E from "effect/Effect";
import { TransactionManager } from "../../../domain/execution/services/TransactionManager";

export const asPluginTransaction = <A, E, R>(task: E.Effect<A, E, R>) =>
	E.gen(function* () {
		const transaction = yield* E.serviceOptional(TransactionManager);
		/**
		 * Must run in a transaction
		 * */
		return yield* transaction.run("updateApiPlugins", task);
	}).pipe(E.orDie);
