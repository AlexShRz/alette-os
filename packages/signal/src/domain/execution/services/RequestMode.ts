import * as E from "effect/Effect";

// TODO: Add stream mode
export type TRequestMode = "oneShot" | "subscription";

export class RequestMode extends E.Service<RequestMode>()("RequestMode", {
	scoped: E.fn(function* (mode: TRequestMode) {
		return {
			isOneShot() {
				return mode === "oneShot";
			},

			get() {
				return mode;
			},
		};
	}),
}) {}
