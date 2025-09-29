import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { orPanic } from "../../../../domain/errors/utils/orPanic";
import { queryTask } from "../../../plugins/tasks/primitive/functions";
import { asTokenTransaction } from "../../utils/asTokenTransaction";

export const forToken = (tokenId: string) =>
	queryTask(
		asTokenTransaction(
			tokenId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const tokens = auth.getTokenRegistry();
				const token = yield* tokens.get(tokenId);

				if (!token) {
					return "";
				}

				return yield* token.get();
			}),
		).pipe(orPanic),
	);
