import { setUpApiTestEnv } from "@alette/signal-test-utils";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/__tests__/utils";

setUpApiTestEnv();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
