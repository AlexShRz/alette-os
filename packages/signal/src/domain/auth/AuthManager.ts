import * as E from "effect/Effect";
import { TokenRegistry } from "./tokens/TokenRegistry";

export class AuthManager extends E.Service<AuthManager>()("AuthManager", {
	dependencies: [TokenRegistry.Default],
	scoped: E.gen(function* () {
		const tokens = yield* TokenRegistry;

		return {
			getTokenRegistry() {
				return tokens;
			},
		};
	}),
}) {}
