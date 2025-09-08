import * as E from "effect/Effect";
import { responseAdapter } from "../../../response";
import { ResponseAdapter } from "../../../response/adapter/ResponseAdapter";

export class RequestValueAdapters extends E.Service<RequestValueAdapters>()(
	"RequestValueAdapters",
	{
		scoped: E.gen(function* () {
			let adapter = responseAdapter().build();

			return {
				getAdapter() {
					return adapter;
				},
				setAdapter(providedAdapter: ResponseAdapter) {
					adapter = providedAdapter;
				},
			};
		}),
	},
) {}
