import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { TAuthEntityCredentialSupplier } from "../../../../domain/auth/AuthTypes";
import { task } from "../../../plugins/tasks/primitive/functions";

export const setTokenCredentials = (
	tokenId: string,
	supplier: TAuthEntityCredentialSupplier,
) =>
	task(
		E.gen(function* () {
			const auth = yield* E.serviceOptional(AuthManager);
			const tokens = auth.getTokenRegistry();
			const token = yield* tokens.get(tokenId);

			if (!token) {
				return;
			}

			const credentials = token.getCredentials();
			yield* credentials.set(supplier);
		}).pipe(E.orDie, E.fork),
	);
