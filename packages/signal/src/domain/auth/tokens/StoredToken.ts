import { IHeaders } from "@alette/pulse";
import * as E from "effect/Effect";
import * as P from "effect/Predicate";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { panic } from "../../errors/utils/panic";
import { TAuthEntityStatus } from "../AuthTypes";
import { AuthEntityCredentials } from "../services/AuthEntityCredentials";
import { AuthEntityScheduledRefresh } from "../services/AuthEntityScheduledRefresh";
import {
	AuthEntitySubscribers,
	IAuthEntityChangeSubscriber,
} from "../services/AuthEntitySubscribers";
import { ITokenConfig, TokenConfig } from "./TokenConfig";
import { ITokenHeaderConverter, ITokenSupplier } from "./TokenTypes";
import {
	RefreshTokenTypeValidationError,
	TokenTypeValidationError,
} from "./errors";

interface ITokenUpdateResult {
	value: string;
	refreshToken: null | string;
	status: TAuthEntityStatus;
}

type TStoredTokenState = Omit<
	ITokenConfig,
	"headerConverter" | "credentials"
> & {
	value: ITokenUpdateResult["value"];
	refreshToken: ITokenUpdateResult["refreshToken"];
	status: TAuthEntityStatus;
	headerConverter: ITokenHeaderConverter;
};

export class StoredToken extends E.Service<StoredToken>()("StoredToken", {
	dependencies: [
		AuthEntitySubscribers.Default,
		AuthEntityScheduledRefresh.Default,
	],
	scoped: E.fn(function* (config: TokenConfig) {
		const globalContext = yield* GlobalContext;
		const credentials = yield* AuthEntityCredentials;
		const subscribers = yield* AuthEntitySubscribers;
		const tokenRefresher = yield* AuthEntityScheduledRefresh;

		const runtime = yield* E.runtime();
		const runPromise = Runtime.runPromise(runtime);

		const refreshInterval = config.getRefreshInterval();
		const state = yield* SynchronizedRef.make<TStoredTokenState>({
			id: config.getId(),
			/**
			 * Our token is always an empty string by default.
			 * */
			value: "",
			refreshToken: null,
			/**
			 * 1. By default, all tokens are invalid.
			 * 2. This status will trigger automatic token refresh on "token.get()"
			 * and fill our initial token values.
			 * */
			status: "uninitialized",
			supplier: config.getSupplier(),
			headerConverter: config.getHeaderConverter(),
		});

		/**
		 * 1. For some reason if try to access
		 * returned state immediately after update, we get
		 * outdated data.
		 * 2. This is why we return void here and force users
		 * to query state again using "state.get"
		 * */
		const refreshToken = E.zipLeft(
			E.void,
			SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
				E.gen(function* () {
					if (currentState.status === "valid") {
						return currentState;
					}

					return yield* forceRefreshToken(currentState);
				}),
			),
		);

		const assertTokenValue = (token: unknown) =>
			runPromise(
				E.gen(function* () {
					if (!P.isString(token)) {
						yield* panic(new TokenTypeValidationError(token));
					}
				}),
			);

		const assertRefreshTokenValue = (token: unknown) =>
			runPromise(
				E.gen(function* () {
					if (!P.isString(token)) {
						yield* panic(new RefreshTokenTypeValidationError(token));
					}
				}),
			);

		const forceRefreshToken = (tokenState: TStoredTokenState) =>
			E.gen(function* () {
				const { id, supplier, status, refreshToken, value } = tokenState;

				const getNewToken = async () =>
					await supplier({
						id,
						isInvalid: status === "invalid",
						prevToken: value,
						refreshToken,
						context: await globalContext.getAsPromise(),
						getCredentials: () => runPromise(credentials.get()),
						getCredentialsOrThrow: () => runPromise(credentials.getOrThrow()),
					});

				const result = yield* E.promise(async () => {
					await subscribers.runPromise("loading");

					try {
						const newTokenData = await getNewToken();
						const commonTokenData = {
							status: "valid" as TAuthEntityStatus,
						};

						if (!P.isRecord(newTokenData)) {
							await assertTokenValue(newTokenData);

							return {
								value: newTokenData,
								/**
								 * If only a string is returned,
								 * reset our old refresh token
								 * */
								refreshToken: null,
								...commonTokenData,
							} satisfies ITokenUpdateResult;
						}

						await assertTokenValue(newTokenData.token);
						await assertRefreshTokenValue(newTokenData.refreshToken);

						return {
							value: newTokenData.token,
							refreshToken: newTokenData.refreshToken,
							...commonTokenData,
						} satisfies ITokenUpdateResult;
					} catch {
						/**
						 * If our fn throws, we need to set
						 * our token status to invalid and reset
						 * our refreshToken.
						 * */
						return {
							value,
							refreshToken: null,
							status: "invalid",
						} satisfies ITokenUpdateResult;
					}
				});

				yield* subscribers.run(result.status);
				return { ...tokenState, ...result };
			});

		/**
		 * 1. Configure auto token refresh if needed
		 * 2. Token refresh mustn't care about whether our token is valid -
		 * sometimes people need to refresh tokens while they are still
		 * valid to avoid bad UX.
		 * */
		tokenRefresher.refreshPeriodically(
			refreshInterval,
			SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
				forceRefreshToken(currentState),
			),
		);

		return {
			get() {
				return E.gen(function* () {
					const { value, status } = yield* state.get;

					if (status === "invalid" || status === "uninitialized") {
						yield* refreshToken;
						const newState = yield* state.get;
						return newState.value;
					}

					return value;
				});
			},

			getStatus() {
				return E.gen(function* () {
					const { status } = yield* state.get;
					return status;
				});
			},

			getCredentials() {
				return credentials;
			},

			setSupplier(supplier: ITokenSupplier) {
				return E.zipLeft(
					E.void,
					SynchronizedRef.getAndUpdate(state, (currentState) => ({
						...currentState,
						supplier,
					})),
				);
			},

			refresh() {
				return E.zipLeft(E.void, refreshToken);
			},

			forceRefresh() {
				return E.zipLeft(
					E.void,
					SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
						forceRefreshToken(currentState),
					),
				);
			},

			invalidate() {
				return E.zipLeft(
					E.void,
					SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
						E.gen(function* () {
							yield* subscribers.run("invalid");

							return {
								...currentState,
								status: "invalid" as const,
							};
						}),
					),
				);
			},

			subscribe(listener: IAuthEntityChangeSubscriber) {
				return E.gen(function* () {
					const { status } = yield* state.get;
					yield* subscribers.subscribe(status, listener);
				});
			},

			unsubscribe(subscriberReference: IAuthEntityChangeSubscriber) {
				return subscribers.unsubscribe(subscriberReference);
			},

			toHeaders() {
				return E.gen(this, function* () {
					const tokenValue = yield* this.get();
					const { headerConverter } = yield* state.get;
					const context = yield* globalContext.get();

					const getHeaders = async () =>
						await headerConverter({ context, token: tokenValue });

					return yield* E.promise(() => getHeaders()).pipe(
						E.orElseSucceed(() => ({}) as IHeaders),
					);
				});
			},
		};
	}),
}) {}
