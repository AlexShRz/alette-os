import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

export type TApiEnvironmentMode = "test" | "debug" | "production";

export class EnvironmentMode extends E.Service<EnvironmentMode>()(
	"EnvironmentMode",
	{
		effect: E.gen(function* () {
			const state = yield* SubscriptionRef.make<TApiEnvironmentMode>(
				((): TApiEnvironmentMode => {
					if ("vi" in globalThis || "jest" in globalThis) {
						return "test";
					}

					return "debug";
				})(),
			);

			return {
				isTest() {
					return state.get.pipe(E.andThen((e) => e === "test"));
				},

				isDebug() {
					return state.get.pipe(E.andThen((e) => e === "debug"));
				},

				isProduction() {
					return state.get.pipe(E.andThen((e) => e === "production"));
				},

				get() {
					return state.get.pipe(E.andThen((e) => e));
				},

				set(env: TApiEnvironmentMode) {
					return SubscriptionRef.getAndUpdate(state, () => env);
				},

				track() {
					/**
					 * Stream.changes is required to avoid
					 * streaming duplicate values.
					 * */
					return state.changes.pipe(Stream.changes);
				},
			};
		}),
	},
) {}
