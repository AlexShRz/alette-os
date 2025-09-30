import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const forceRefreshToken = (tokenId: string) =>
	task(
		asAuthEntityTransaction(
			tokenId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const tokens = auth.getTokenRegistry();
				const token = yield* tokens.get(tokenId);

				if (!token) {
					return;
				}

				return yield* token.forceRefresh();
			}),
		).pipe(E.orDie),
	);
