import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { IAuthEntityChangeSubscriber } from "../../../../domain/auth/services/AuthEntitySubscribers";
import { task } from "../../../plugins/tasks/primitive/functions";

export const unsubscribeFromCookieUpdates = (
	cookieId: string,
	listenerReference: IAuthEntityChangeSubscriber,
) =>
	task(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const cookies = auth.getCookieRegistry();
			const cookie = yield* cookies.get(cookieId);

			if (!cookie) {
				return;
			}

			yield* cookie.unsubscribe(listenerReference);
		}).pipe(E.orDie),
	);
