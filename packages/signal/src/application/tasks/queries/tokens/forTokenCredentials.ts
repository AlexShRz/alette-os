import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { orPanic } from "../../../../domain/errors/utils/orPanic";
import { queryTask } from "../../../plugins/tasks/primitive/functions";

export const forTokenCredentials = <Credentials = unknown>(tokenId: string) =>
	queryTask(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const tokens = auth.getTokenRegistry();
			const token = yield* tokens.get(tokenId);

			if (!token) {
				return null;
			}

			const credentialManager = token.getCredentials();
			const credentials = yield* credentialManager.get();
			return credentials as Credentials;
		}).pipe(orPanic),
	);
