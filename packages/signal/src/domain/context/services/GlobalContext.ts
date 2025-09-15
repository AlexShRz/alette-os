import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { IGlobalContext } from "../IGlobalContext";

export class GlobalContext extends E.Service<GlobalContext>()("GlobalContext", {
	effect: E.gen(function* () {
		const context = yield* SynchronizedRef.make<IGlobalContext>({});

		return {
			get() {
				return context.get;
			},

			set(newContext: IGlobalContext) {
				return SynchronizedRef.set(context, newContext);
			},
		};
	}),
}) {}
