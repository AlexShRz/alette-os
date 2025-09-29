import { IHeaders } from "@alette/pulse";
import * as Duration from "effect/Duration";
import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { AuthEntityCredentials } from "../AuthEntityCredentials";
import {
	ITokenChangeSubscriber,
	StoredTokenSubscribers,
} from "./StoredTokenSubscribers";
import { ITokenConfig, TokenConfig } from "./TokenConfig";
import {
	ITokenHeaderConverter,
	ITokenSupplier,
	TTokenStatus,
} from "./TokenTypes";

interface ITokenUpdateResult {
	value: string;
	status: TTokenStatus;
}

type TStoredTokenState = Omit<
	ITokenConfig,
	"headerConverter" | "credentials"
> & {
	value: string;
	status: TTokenStatus;
	headerConverter: ITokenHeaderConverter;
};

export class StoredToken extends E.Service<StoredToken>()("StoredToken", {
	dependencies: [StoredTokenSubscribers.Default],
	scoped: E.fn(function* (config: TokenConfig) {
		const globalContext = yield* GlobalContext;
		const credentials = yield* AuthEntityCredentials;
		const subscribers = yield* StoredTokenSubscribers;

		const runtime = yield* E.runtime();
		const runFork = Runtime.runFork(runtime);
		const runPromise = Runtime.runPromise(runtime);

		const refreshInterval = config.getRefreshInterval();
		let tokenRefreshIntervalId: number | null = null;
		const state = yield* SynchronizedRef.make<TStoredTokenState>({
			id: config.getId(),
			/**
			 * Our token is always an empty string by default.
			 * */
			value: "",
			/**
			 * 1. By default, all tokens are invalid.
			 * 2. This status will trigger automatic token refresh on "token.get()"
			 * and fill our initial token values.
			 * */
			status: "invalid",
			supplier: config.getSupplier(),
			headerConverter: config.getHeaderConverter(),
		});

		yield* E.addFinalizer(() =>
			E.sync(() => {
				if (tokenRefreshIntervalId) {
					clearInterval(tokenRefreshIntervalId);
				}
			}),
		);

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

		const forceRefreshToken = (tokenState: TStoredTokenState) =>
			E.gen(function* () {
				const { supplier, value } = tokenState;

				const getNewToken = async () =>
					await supplier({
						context: await globalContext.getPromise(),
						getCredentials: () => runPromise(credentials.get()),
						getCredentialsOrThrow: () => runPromise(credentials.getOrThrow()),
						prevToken: value,
					});

				const result = yield* E.promise(async () => {
					await subscribers.runPromise("loading");

					try {
						const newToken = await getNewToken();
						return {
							value: newToken,
							status: "valid",
						} satisfies ITokenUpdateResult;
					} catch {
						/**
						 * If our fn throws, we need to set
						 * our token status to invalid and keep
						 * previous token value
						 * */
						return {
							value,
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
		if (refreshInterval) {
			const id = setInterval(
				() => {
					runFork(
						SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
							forceRefreshToken(currentState),
						),
					);
				},
				Duration.toMillis(Duration.decode(refreshInterval)),
			);
			tokenRefreshIntervalId = id as unknown as number;
		}

		return {
			get() {
				return E.gen(function* () {
					const { value, status } = yield* state.get;

					if (status === "invalid") {
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

			subscribe(listener: ITokenChangeSubscriber) {
				return E.gen(function* () {
					const { status } = yield* state.get;
					yield* subscribers.subscribe(status, listener);
				});
			},

			unsubscribe(subscriberReference: ITokenChangeSubscriber) {
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
