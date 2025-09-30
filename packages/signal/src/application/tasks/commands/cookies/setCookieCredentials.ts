import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { TAuthEntityCredentialSupplier } from "../../../../domain/auth/AuthTypes";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const setCookieCredentials = (
	cookieId: string,
	supplier: TAuthEntityCredentialSupplier,
) =>
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

				const credentials = cookie.getCredentials();
				yield* credentials.set(supplier);
			}),
		).pipe(E.orDie),
	);
