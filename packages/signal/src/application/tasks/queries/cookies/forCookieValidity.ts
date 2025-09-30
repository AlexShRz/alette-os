import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { queryTask } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const forCookieValidity = (cookieId: string) =>
	queryTask(
		asAuthEntityTransaction(
			cookieId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const cookies = auth.getCookieRegistry();
				const cookie = yield* cookies.get(cookieId);

				if (!cookie) {
					return "invalid";
				}

				return yield* cookie.getStatus();
			}),
		).pipe(E.orDie),
	);
