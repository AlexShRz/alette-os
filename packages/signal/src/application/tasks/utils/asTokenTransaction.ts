import * as E from "effect/Effect";
import { TransactionManager } from "../../../domain/execution/services/TransactionManager";

export const asTokenTransaction = <A, E, R>(
	tokenId: string,
	task: E.Effect<A, E, R>,
) =>
	E.gen(function* () {
		const transaction = yield* E.serviceOptional(TransactionManager);
		return yield* transaction.run(`tokens-accessState-${tokenId}`, task);
	}).pipe(E.orDie);
