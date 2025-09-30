import * as E from "effect/Effect";
import { CookieRegistry } from "./cookies/CookieRegistry";
import { TokenRegistry } from "./tokens/TokenRegistry";

export class AuthManager extends E.Service<AuthManager>()("AuthManager", {
	dependencies: [TokenRegistry.Default, CookieRegistry.Default],
	scoped: E.gen(function* () {
		const tokens = yield* TokenRegistry;
		const cookies = yield* CookieRegistry;

		return {
			getTokenRegistry() {
				return tokens;
			},

			getCookieRegistry() {
				return cookies;
			},
		};
	}),
}) {}
