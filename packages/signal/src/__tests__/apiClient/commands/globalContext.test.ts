import { expect } from "@effect/vitest";
import { forContext, setContext } from "../../../application";
import { client } from "../../../infrastructure/ApiClient.js";

test("it sets global context", async () => {
	const context = { hiThere: "asdasdasd" };
	const api = client(setContext(context));

	const obtainedContext1 = await api.ask(forContext());
	expect(obtainedContext1).toStrictEqual(context);

	const newContext = { asdkjbnaskdjnasjkndas: "asdasd" };
	api.tell(setContext(newContext));

	const obtainedContext2 = await api.ask(forContext());
	expect(obtainedContext2).toStrictEqual(newContext);
});

test("it sets global context from sync factories", async () => {
	const context1 = { hiThere: "asdasdasd" };
	const api = client(setContext(() => context1));

	const obtainedContext1 = await api.ask(forContext());
	expect(obtainedContext1).toStrictEqual(context1);
});

test("it sets global context from async  factories", async () => {
	const context1 = { hiThere: "asdasdasd" };
	const api = client(setContext(async () => context1));

	const obtainedContext1 = await api.ask(forContext());
	expect(obtainedContext1).toStrictEqual(context1);
});
