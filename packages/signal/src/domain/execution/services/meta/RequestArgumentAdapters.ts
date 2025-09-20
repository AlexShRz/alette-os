import * as E from "effect/Effect";
import { argumentAdapter } from "../../../preparation";
import { ArgumentAdapter } from "../../../preparation/context/arguments/adapter/ArgumentAdapter";

export class RequestArgumentAdapters extends E.Service<RequestArgumentAdapters>()(
	"RequestArgumentAdapters",
	{
		scoped: E.gen(function* () {
			let adapter = argumentAdapter().build();

			return {
				getAdapter() {
					return adapter;
				},
				setAdapter(providedAdapter: ArgumentAdapter) {
					adapter = providedAdapter;
				},
			};
		}),
	},
) {}
