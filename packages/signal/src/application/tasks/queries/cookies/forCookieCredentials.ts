import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { orPanic } from "../../../../domain/errors/utils/orPanic";
import { queryTask } from "../../../plugins/tasks/primitive/functions";

export const forCookieCredentials = <Credentials = unknown>(cookieId: string) =>
	queryTask(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const cookies = auth.getCookieRegistry();
			const cookie = yield* cookies.get(cookieId);

			if (!cookie) {
				return null;
			}

			const credentialManager = cookie.getCredentials();
			const credentials = yield* credentialManager.get();
			return credentials as Credentials;
		}).pipe(orPanic),
	);
