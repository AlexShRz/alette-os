import * as E from "effect/Effect";
import { TransactionManager } from "../../../domain/execution/services/TransactionManager";

export const asAuthEntityTransaction = <A, E, R>(
	tokenId: string,
	task: E.Effect<A, E, R>,
) =>
	E.gen(function* () {
		const transaction = yield* E.serviceOptional(TransactionManager);
		return yield* transaction.run(
			`authEntity-accessOrModifyState-${tokenId}`,
			task,
		);
	}).pipe(E.orDie);
