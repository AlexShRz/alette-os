import { vi } from "vitest";

export const mockConsoleLog = () =>
	vi.spyOn(console, "log").mockImplementation(() => {});
