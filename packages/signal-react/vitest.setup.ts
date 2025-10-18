import "@testing-library/jest-dom/vitest";
import { setUpApiTestEnv } from "@alette/signal-test-utils";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
// @ts-ignore
import { api } from "./src/__tests__/utils/api";
// @ts-ignore
import { server } from "./src/__tests__/utils/server";

setUpApiTestEnv();
afterEach(() => {
	api.reset();
});

afterEach(() => {
	vi.useRealTimers();
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
