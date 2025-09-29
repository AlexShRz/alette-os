import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { ITokenChangeSubscriber } from "../../../../domain/auth/tokens/StoredTokenSubscribers";
import { task } from "../../../plugins/tasks/primitive/functions";

export const subscribeToTokenUpdates = (
	tokenId: string,
	listener: ITokenChangeSubscriber,
) =>
	task(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const tokens = auth.getTokenRegistry();
			const token = yield* tokens.get(tokenId);

			if (!token) {
				return;
			}

			yield* token.subscribe(listener);
		}).pipe(E.orDie),
	);
