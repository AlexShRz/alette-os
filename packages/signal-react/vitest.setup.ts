import { beforeEach } from "vitest";
import { api } from "./__tests__/testApi";

beforeEach(() => {
	api.reset();
});
