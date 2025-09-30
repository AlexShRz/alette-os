import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { IAuthEntityChangeSubscriber } from "../../../../domain/auth/services/AuthEntitySubscribers";
import { task } from "../../../plugins/tasks/primitive/functions";

export const unsubscribeFromTokenUpdates = (
	tokenId: string,
	listenerReference: IAuthEntityChangeSubscriber,
) =>
	task(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const tokens = auth.getTokenRegistry();
			const token = yield* tokens.get(tokenId);

			if (!token) {
				return;
			}

			yield* token.unsubscribe(listenerReference);
		}).pipe(E.orDie),
	);
