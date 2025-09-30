import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../../context/services/GlobalContext";
import { TRequestGlobalContext } from "../../context/typeUtils/RequestIOTypes";
import { TAuthEntityStatus } from "../AuthTypes";

export interface IAuthEntityChangeSubscriber {
	loading?: (options: TRequestGlobalContext) => void | Promise<void>;
	valid?: (options: TRequestGlobalContext) => void | Promise<void>;
	invalid?: (options: TRequestGlobalContext) => void | Promise<void>;
}

export class AuthEntitySubscribers extends E.Service<AuthEntitySubscribers>()(
	"AuthEntitySubscribers",
	{
		scoped: E.gen(function* () {
			const globalContext = yield* GlobalContext;
			const subscribers = yield* SynchronizedRef.make<
				IAuthEntityChangeSubscriber[]
			>([]);
			const runPromise = Runtime.runPromise(yield* E.runtime());

			const runListeners = (
				subscribers: IAuthEntityChangeSubscriber[],
				key: keyof IAuthEntityChangeSubscriber,
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
				run(status: TAuthEntityStatus | "loading") {
					return E.gen(function* () {
						const currentSubscribers = yield* subscribers.get;
						return yield* runListeners(currentSubscribers, status);
					});
				},

				runPromise(status: TAuthEntityStatus | "loading") {
					return runPromise(this.run(status));
				},

				subscribe(
					status: TAuthEntityStatus,
					subscriber: IAuthEntityChangeSubscriber,
				) {
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

				unsubscribe(subscriberReference: IAuthEntityChangeSubscriber) {
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
