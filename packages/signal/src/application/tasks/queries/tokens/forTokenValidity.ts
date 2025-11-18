import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { queryTask } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const forTokenValidity = (tokenId: string) =>
	queryTask(
		asAuthEntityTransaction(
			tokenId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const tokens = auth.getTokenRegistry();
				const token = yield* tokens.get(tokenId);

				if (!token) {
					return false;
				}

				const status = yield* token.getStatus();
				return status === "valid";
			}),
		).pipe(E.orDie),
	);
