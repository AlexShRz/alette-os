import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { CookieConfig } from "../../../../domain/auth/cookies/CookieConfig";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const createCookie = (cookieConfig: CookieConfig) =>
	task(
		asAuthEntityTransaction(
			cookieConfig.getId(),
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const cookies = auth.getCookieRegistry();
				return yield* cookies.getOrCreate(cookieConfig);
			}),
		).pipe(E.orDie),
	);
