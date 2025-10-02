import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { TransactionManager } from "../../execution/services/TransactionManager";
import { IGlobalContext } from "../IGlobalContext";

export class GlobalContext extends E.Service<GlobalContext>()("GlobalContext", {
	dependencies: [TransactionManager.Default],
	effect: E.gen(function* () {
		const transactionManager = yield* TransactionManager;
		const context = yield* SynchronizedRef.make<IGlobalContext>({});
		const runPromise = Runtime.runPromise(yield* E.runtime());

		/**
		 * Make sure to wrap getters inside a transaction,
		 * otherwise there will be race conditions.
		 * */
		return {
			get() {
				return this.transaction(context.get);
			},

			getAsPromise() {
				return runPromise(this.get());
			},

			set(nextContext: IGlobalContext) {
				return SynchronizedRef.set(context, nextContext);
			},

			transaction<A, E, R>(task: E.Effect<A, E, R>) {
				return transactionManager.run("modifyOrAccessGlobalContext", task);
			},
		};
	}),
}) {}
