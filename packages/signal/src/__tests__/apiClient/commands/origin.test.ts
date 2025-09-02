import { expect } from "@effect/vitest";
import { forOrigin, setOrigin } from "../../../application";
import { client } from "../../../infrastructure/ApiClient.js";

test("it sets global origin", async () => {
	const origin1 = "https://www.wikipedia.org/";
	const api = client();

	const gotOrigin1 = await api.ask(forOrigin());
	expect(gotOrigin1).toEqual("");

	api.tell(setOrigin(origin1));
	const gotOrigin2 = await api.ask(forOrigin());
	expect(gotOrigin2).toEqual(origin1);

	const origin2 = "https://www.heyyy.org/";
	api.tell(setOrigin(origin2));
	const gotOrigin3 = await api.ask(forOrigin());
	expect(gotOrigin3).toEqual(origin2);
});
