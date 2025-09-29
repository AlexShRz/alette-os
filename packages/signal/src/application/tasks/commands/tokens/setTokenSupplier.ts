import * as E from "effect/Effect";
import { AuthManager } from "../../../../domain/auth/AuthManager";
import { ITokenSupplier } from "../../../../domain/auth/tokens/TokenTypes";
import { task } from "../../../plugins/tasks/primitive/functions";
import { asTokenTransaction } from "../../utils/asTokenTransaction";

export const setTokenSupplier = (tokenId: string, supplier: ITokenSupplier) =>
	task(
		asTokenTransaction(
			tokenId,
			E.gen(function* () {
				const auth = yield* E.serviceOptional(AuthManager);
				const tokens = auth.getTokenRegistry();
				const token = yield* tokens.get(tokenId);

				if (!token) {
					return;
				}

				yield* token.setSupplier(supplier);
			}),
		).pipe(E.orDie),
	);
