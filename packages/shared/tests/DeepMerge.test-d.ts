// @ts-nocheck
import { test } from "vitest";
import { TDeepMerge } from "../src";

test.todo("...", () => {
	type Final1 = TDeepMerge<
		{ value: { test: string } },
		{ value: { method: "DELETE" } }
	>;
	type Final2 = TDeepMerge<
		{ we: string; value: { test: string; body: { hii: string } } },
		{ value: { body: { hello: string } } }
	>;

	type Final3 = TDeepMerge<
		{ value: { body: string; heyy: string; method: "DELETE" } },
		{ value: { body: { hello: string } } }
	>;

	type Final4 = TDeepMerge<
		// { hey: string; value: { body: string; heyy: string; method: "DELETE" } },
		{
			hey: string;
			value: { body: { hi: string }; heyy: string; method: "DELETE" };
		},
		{
			mergeMe: string;
			value: { body: { helloo: string }; mergeMe2: string };
		}
	>;

	type Final5 = TDeepMerge<
		{
			hey: string;
			value: { errors: "hi" | "there"; heyy: string; method: "DELETE" };
		},
		{
			value: { errors: "hello"; mergeMe2: string };
		}
	>;

	// Must handle unknown
	type Final6 = TDeepMerge<
		{
			types: { errors: unknown; originalErrorType: unknown };
		},
		{
			types: {
				errors: "asd";
				originalErrorType: "asdas";
			};
		}
	>;
});
