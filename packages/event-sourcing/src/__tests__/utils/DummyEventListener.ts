import { Effect as E } from "effect";
import { EventBusListener } from "../../listeners/EventBusListener.js";

export const makeDummyEventListener = () =>
	EventBusListener.make(({ parent }) =>
		E.gen(function* () {
			return {
				...parent,
			};
		}),
	);
