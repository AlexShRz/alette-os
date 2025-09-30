import * as E from "effect/Effect";
import { TokenConfig } from "../../../../domain";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asAuthEntityTransaction } from "../../utils/asAuthEntityTransaction";

export const createToken = (tokenConfig: TokenConfig) =>
	task(
		asAuthEntityTransaction(
			tokenConfig.getId(),
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const tokens = auth.getTokenRegistry();
				return yield* tokens.getOrCreate(tokenConfig);
			}),
		).pipe(E.orDie),
	);
