import * as E from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { IGlobalContext } from "../IGlobalContext";

export class GlobalContext extends E.Service<GlobalContext>()("GlobalContext", {
	effect: E.gen(function* () {
		const context = yield* SynchronizedRef.make<IGlobalContext>({});
		const runPromise = Runtime.runPromise(yield* E.runtime());

		return {
			get() {
				return context.get;
			},

			getAsPromise() {
				return runPromise(this.get());
			},

			set(newContext: IGlobalContext) {
				return SynchronizedRef.set(context, newContext);
			},
		};
	}),
}) {}
