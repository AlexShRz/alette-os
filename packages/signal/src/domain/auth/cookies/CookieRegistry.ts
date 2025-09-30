import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LayerMap from "effect/LayerMap";
import * as RcMap from "effect/RcMap";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { ErrorHandler } from "../../errors/ErrorHandler";
import { orPanic } from "../../errors/utils/orPanic";
import { AuthEntityCredentials } from "../services/AuthEntityCredentials";
import { CookieConfig } from "./CookieConfig";
import { StoredCookie } from "./StoredCookie";
import { CannotFindCookieConfigError } from "./errors";

export class CookieRegistry extends E.Service<CookieRegistry>()(
	"CookieRegistry",
	{
		scoped: E.gen(function* () {
			const context = yield* E.context<GlobalContext | ErrorHandler>();

			const cookies = yield* SynchronizedRef.make(
				yield* LayerMap.make(
					(cookieConfig: CookieConfig) =>
						StoredCookie.Default(cookieConfig).pipe(
							Layer.provide(
								Layer.mergeAll(
									AuthEntityCredentials.Default(
										"cookie",
										cookieConfig.getCredentials(),
									),
									Layer.succeedContext(context),
								),
							),
						),
					{ idleTimeToLive: Infinity },
				),
			);

			const findToken = (cookieId: string) =>
				E.gen(function* () {
					const registry = yield* cookies.get;
					const cookieConfigs = yield* RcMap.keys(registry.rcMap);
					return cookieConfigs.find((config) => config.getId() === cookieId);
				});

			return {
				has(cookieId: string) {
					return E.gen(function* () {
						const cookieConfig = yield* findToken(cookieId);
						return !!cookieConfig;
					});
				},

				get(cookieId: string) {
					return E.gen(this, function* () {
						const cookieConfig = yield* findToken(cookieId);

						if (!cookieConfig) {
							return null;
						}

						const registry = yield* cookies.get;
						const cookieRuntime = yield* registry.runtime(cookieConfig);
						return yield* E.serviceOptional(StoredCookie).pipe(
							E.provide(cookieRuntime),
						);
					}).pipe(orPanic, E.scoped);
				},

				getOrThrow(cookieId: string) {
					return E.gen(this, function* () {
						const cookie = yield* this.get(cookieId);

						if (!cookie) {
							return yield* new CannotFindCookieConfigError(cookieId);
						}

						return cookie;
					}).pipe(E.scoped);
				},

				getOrCreate(config: CookieConfig) {
					return E.gen(function* () {
						const registry = yield* cookies.get;
						const cookieRuntime = yield* registry.runtime(config);
						return yield* E.serviceOptional(StoredCookie).pipe(
							E.provide(cookieRuntime),
						);
					}).pipe(orPanic, E.scoped);
				},
			};
		}),
	},
) {}
