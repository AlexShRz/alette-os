import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { IAuthEntityChangeSubscriber } from "../../../../domain/auth/services/AuthEntitySubscribers";
import { task } from "../../../plugins/tasks/primitive/functions";

export const subscribeToCookieUpdates = (
	cookieId: string,
	listener: IAuthEntityChangeSubscriber,
) =>
	task(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const cookies = auth.getCookieRegistry();
			const cookie = yield* cookies.get(cookieId);

			if (!cookie) {
				return;
			}

			yield* cookie.subscribe(listener);
		}).pipe(E.orDie),
	);
