import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { ErrorHandler } from "../../errors/ErrorHandler";
import { orPanic } from "../../errors/utils/orPanic";
import { AuthEntityCredentials } from "../services/AuthEntityCredentials";
import { StoredToken } from "./StoredToken";
import { TokenConfig } from "./TokenConfig";
import { CannotFindTokenError } from "./errors";

export class TokenRegistry extends E.Service<TokenRegistry>()("TokenRegistry", {
	scoped: E.gen(function* () {
		const context = yield* E.context<GlobalContext | ErrorHandler>();

		const tokens = yield* SynchronizedRef.make(
			yield* LayerMap.make(
				(tokenConfig: TokenConfig) =>
					StoredToken.Default(tokenConfig).pipe(
						Layer.provide(
							Layer.mergeAll(
								AuthEntityCredentials.Default(
									"token",
									tokenConfig.getCredentials(),
								),
								Layer.succeedContext(context),
							),
						),
					),
				{ idleTimeToLive: Infinity },
			),
		);

		const findToken = (tokenId: string) =>
			E.gen(function* () {
				const registry = yield* tokens.get;
				const tokenConfigs = yield* RcMap.keys(registry.rcMap);
				return tokenConfigs.find((config) => config.getId() === tokenId);
			});

		return {
			has(tokenId: string) {
				return E.gen(function* () {
					const tokenConfig = yield* findToken(tokenId);
					return !!tokenConfig;
				});
			},

			get(tokenId: string) {
				return E.gen(this, function* () {
					const tokenConfig = yield* findToken(tokenId);

					if (!tokenConfig) {
						return null;
					}

					const registry = yield* tokens.get;
					const tokenRuntime = yield* registry.runtime(tokenConfig);
					return yield* E.serviceOptional(StoredToken).pipe(
						E.provide(tokenRuntime),
					);
				}).pipe(orPanic, E.scoped);
			},

			getOrThrow(tokenId: string) {
				return E.gen(this, function* () {
					const token = yield* this.get(tokenId);

					if (!token) {
						return yield* new CannotFindTokenError(tokenId);
					}

					return token;
				}).pipe(E.scoped);
			},

			getOrCreate(config: TokenConfig) {
				return E.gen(function* () {
					const registry = yield* tokens.get;
					const tokenRuntime = yield* registry.runtime(config);
					return yield* E.serviceOptional(StoredToken).pipe(
						E.provide(tokenRuntime),
					);
				}).pipe(orPanic, E.scoped);
			},
		};
	}),
}) {}
