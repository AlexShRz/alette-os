import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const refreshCookie = (cookieId: string) =>
	task(
		asAuthEntityTransaction(
			cookieId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const cookies = auth.getCookieRegistry();
				const cookie = yield* cookies.get(cookieId);

				if (!cookie) {
					return;
				}

				yield* cookie.refresh();
			}),
		).pipe(E.orDie, E.fork),
	);
