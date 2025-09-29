import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { TRequestGlobalContext } from "../../context/typeUtils/RequestIOTypes";
import { TTokenStatus } from "./TokenTypes";

export interface ITokenChangeSubscriber {
	loading?: (options: TRequestGlobalContext) => void | Promise<void>;
	valid?: (options: TRequestGlobalContext) => void | Promise<void>;
	invalid?: (options: TRequestGlobalContext) => void | Promise<void>;
}

export class StoredTokenSubscribers extends E.Service<StoredTokenSubscribers>()(
	"StoredTokenSubscribers",
	{
		scoped: E.gen(function* () {
			const globalContext = yield* GlobalContext;
			const subscribers = yield* SynchronizedRef.make<ITokenChangeSubscriber[]>(
				[],
			);
			const runPromise = Runtime.runPromise(yield* E.runtime());

			const runListeners = (
				subscribers: ITokenChangeSubscriber[],
				key: keyof ITokenChangeSubscriber,
			) =>
				E.gen(function* () {
					const filteredSubscribers = subscribers
						.map((record) => record[key])
						.filter((v) => !!v);
					const tasks = filteredSubscribers.map((subscriber) =>
						E.promise(
							async () =>
								await subscriber({
									context: await globalContext.getPromise(),
								}),
						),
					);

					yield* E.all(tasks);
				});

			return {
				run(status: TTokenStatus | "loading") {
					return E.gen(function* () {
						const currentSubscribers = yield* subscribers.get;
						return yield* runListeners(currentSubscribers, status);
					});
				},

				runPromise(status: TTokenStatus | "loading") {
					return runPromise(this.run(status));
				},

				subscribe(status: TTokenStatus, subscriber: ITokenChangeSubscriber) {
					return E.zipLeft(
						E.void,
						SynchronizedRef.getAndUpdateEffect(
							subscribers,
							(currentSubscribers) =>
								E.gen(function* () {
									/**
									 * Provide current state to the subscriber asap.
									 * */
									yield* runListeners([subscriber], status);
									return [...currentSubscribers, subscriber];
								}),
						),
					);
				},

				unsubscribe(subscriberReference: ITokenChangeSubscriber) {
					return E.zipLeft(
						E.void,
						SynchronizedRef.getAndUpdate(subscribers, (currentSubscribers) => {
							return currentSubscribers.filter(
								(sub) => sub !== subscriberReference,
							);
						}),
					);
				},
			};
		}),
	},
) {}
