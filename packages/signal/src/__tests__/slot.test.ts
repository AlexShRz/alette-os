import { Schema as S } from "effect";
import { http, HttpResponse } from "msw";
import { blueprint } from "../application";
import {
	allRequestMiddleware,
	baseRequest,
	factory,
	input,
	method,
	methodMiddlewareName,
	origin,
	output,
	reloadable,
	requestSpecification,
	runOnMount,
	slot,
} from "../domain";
import { createTestApi, server } from "./utils";

test("it injects multiple middleware at once", async () => {
	const { custom, testUrl } = createTestApi();
	const value = { res: "asdasjkdh" };

	server.use(
		http.get(testUrl.build(), () => {
			return HttpResponse.json(value);
		}),
	);

	const Args = S.standardSchemaV1(
		S.Struct({
			res: S.String,
		}),
	);

	const withCommonMiddleware = slot(
		input(Args),
		output(Args),
		factory(({ args }) => args),
	);

	const getData = custom(...withCommonMiddleware());

	const response = await getData({ args: value });
	expect(response).toEqual(value);
});

test.todo(
	"it shows ts errors for incompatible middleware wrapped in slot",
	async () => {
		const { core } = createTestApi();

		const spec = requestSpecification()
			.categorizedAs(baseRequest)
			.accepts(...allRequestMiddleware)
			.prohibits(methodMiddlewareName)
			.build();
		const myCustomRequest = blueprint()
			.specification(spec)
			.use(origin(), runOnMount(false), reloadable())
			.belongsTo(core.plugin)
			.build()
			.toFactory();

		const withCommonMiddleware = slot(method("GET"));

		// @ts-expect-error
		myCustomRequest(...withCommonMiddleware());
	},
);
