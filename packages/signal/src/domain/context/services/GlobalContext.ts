import * as E from "effect/Effect";
import { IGlobalContext } from "../IGlobalContext";

export class GlobalContext extends E.Service<GlobalContext>()("GlobalContext", {
	effect: E.gen(function* () {
		let context: IGlobalContext = {};

		return {
			get() {
				return context;
			},

			set(newContext: IGlobalContext) {
				context = newContext;
			},
		};
	}),
}) {}
