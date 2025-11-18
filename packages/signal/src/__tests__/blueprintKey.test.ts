import { r, request } from "@alette/pulse";
import { as, factory, input, output } from "../domain";
import { createTestApi } from "./utils";
import { boundary } from "./utils/server";

/**
 * IMPORTANT:
 * 1. Request blueprint key is a static key that is copied with every clone().
 * Must NEVER be changed.
 * 2. Because this key does not change, UIs can use it
 * inside their lifecycle hooks that set up our request controllers.
 * 3. This allows the request config to be recreated on each
 * component render. When this happens, our "using()" and
 * obtains fresh closures over component props and values.
 * This makes sure that our data is always in sync with the UI,
 * while not breaking internal request routing system.
 * */
test(
	"it does not change blueprint key on clone",
	boundary(async () => {
		const { custom, testUrl } = createTestApi();

		const getData = custom(
			input(as<string>()),
			output(as<string>()),
			factory(() => request(r.route(testUrl.clone()))()),
		);

		const key1 = getData.clone().getKey();
		const key2 = getData.using(() => ({ args: "asd" })).getKey();
		const key3 = getData.with(output(as<string>())).getKey();

		expect(key1).toEqual(key2);
		expect(key1).toEqual(key3);
		expect(key2).toEqual(key1);
		expect(key2).toEqual(key3);
		expect(key3).toEqual(key1);
		expect(key3).toEqual(key2);
	}),
);
