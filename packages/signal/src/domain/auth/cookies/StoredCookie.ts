import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { TAuthEntityStatus } from "../AuthTypes";
import { AuthEntityCredentials } from "../services/AuthEntityCredentials";
import { AuthEntityScheduledRefresh } from "../services/AuthEntityScheduledRefresh";
import {
	AuthEntitySubscribers,
	IAuthEntityChangeSubscriber,
} from "../services/AuthEntitySubscribers";
import { CookieConfig, ICookieConfig } from "./CookieConfig";
import { ICookieSupplier } from "./CookieTypes";

interface ICookieUpdateResult {
	status: TAuthEntityStatus;
}

type TStoredCookieState = Omit<ICookieConfig, "credentials"> & {
	status: TAuthEntityStatus;
};

export class StoredCookie extends E.Service<StoredCookie>()("StoredCookie", {
	dependencies: [
		AuthEntitySubscribers.Default,
		AuthEntityScheduledRefresh.Default,
	],
	scoped: E.fn(function* (config: CookieConfig) {
		const globalContext = yield* GlobalContext;
		const credentials = yield* AuthEntityCredentials;
		const subscribers = yield* AuthEntitySubscribers;
		const cookieRefresher = yield* AuthEntityScheduledRefresh;

		const runtime = yield* E.runtime();
		const runPromise = Runtime.runPromise(runtime);

		const refreshInterval = config.getRefreshInterval();
		const state = yield* SynchronizedRef.make<TStoredCookieState>({
			id: config.getId(),
			status: "invalid",
			supplier: config.getSupplier(),
		});

		const refreshCookie = E.zipLeft(
			E.void,
			SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
				E.gen(function* () {
					if (currentState.status === "valid") {
						return currentState;
					}

					return yield* forceRefreshCookie(currentState);
				}),
			),
		);

		const forceRefreshCookie = (cookieState: TStoredCookieState) =>
			E.gen(function* () {
				const { supplier } = cookieState;

				const loadNewCookie = async () =>
					await supplier({
						context: await globalContext.getAsPromise(),
						getCredentials: () => runPromise(credentials.get()),
						getCredentialsOrThrow: () => runPromise(credentials.getOrThrow()),
					});

				const result = yield* E.promise(async () => {
					await subscribers.runPromise("loading");

					try {
						await loadNewCookie();
						return {
							status: "valid",
						} satisfies ICookieUpdateResult;
					} catch {
						/**
						 * If our fn throws, we need to set
						 * our cookie status to invalid and keep
						 * previous cookie value
						 * */
						return {
							status: "invalid",
						} satisfies ICookieUpdateResult;
					}
				});

				yield* subscribers.run(result.status);
				return { ...cookieState, ...result };
			});

		/**
		 * 1. Configure auto cookie refresh if needed
		 * 2. Cookie refresh mustn't care about whether our cookie is valid -
		 * sometimes people need to refresh cookies while they are still
		 * valid to avoid bad UX.
		 * */
		cookieRefresher.refreshPeriodically(
			refreshInterval,
			SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
				forceRefreshCookie(currentState),
			),
		);

		return {
			getStatus() {
				return E.gen(function* () {
					const { status } = yield* state.get;
					return status;
				});
			},

			getCredentials() {
				return credentials;
			},

			setSupplier(supplier: ICookieSupplier) {
				return E.zipLeft(
					E.void,
					SynchronizedRef.getAndUpdate(state, (currentState) => ({
						...currentState,
						supplier,
					})),
				);
			},

			refresh() {
				return E.zipLeft(E.void, refreshCookie);
			},

			forceRefresh() {
				return E.zipLeft(
					E.void,
					SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
						forceRefreshCookie(currentState),
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
		};
	}),
}) {}
