// @ts-ignore
import { getXMLWithPolyfill } from "@alette/xhr-polyfill";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { server } from "./src/__tests__/utils/server";

beforeAll(() => server.listen());
beforeEach(() => {
	globalThis.XMLHttpRequest = getXMLWithPolyfill() as any;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
