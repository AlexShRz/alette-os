import * as E from "effect/Effect";

export class GlobalUrlConfig extends E.Service<GlobalUrlConfig>()(
	"GlobalUrlConfig",
	{
		effect: E.gen(function* () {
			let origin =
				(globalThis && globalThis.location && globalThis.location.origin) || "";

			return {
				getOrigin() {
					return origin;
				},

				setOrigin(newOrigin: string) {
					origin = newOrigin;
					return origin;
				},
			};
		}),
	},
) {}
