import { expect } from "@effect/vitest";
import {
	forMode,
	setDebugMode,
	setProductionMode,
	setTestMode,
} from "../application";
import { TApiEnvironmentMode } from "../domain";
import { client } from "../infrastructure/ApiClient";

test.each([
	/**
	 * "test" mode should be enabled by default because
	 * we are using vitest here
	 * */
	["test" as TApiEnvironmentMode, setTestMode(), true],
	["production" as TApiEnvironmentMode, setProductionMode(), true],
	[
		"production" as TApiEnvironmentMode,
		setProductionMode(async () => true),
		true,
	],
	["production" as TApiEnvironmentMode, setProductionMode(() => false), false],
	["debug" as TApiEnvironmentMode, setDebugMode(), true],
	["debug" as TApiEnvironmentMode, setDebugMode(() => true), true],
	["debug" as TApiEnvironmentMode, setDebugMode(() => false), false],
])(
	"it sets api environment mode to '%s'",
	async (expected, setMode, shouldPass) => {
		const api = client(setMode);
		const env = await api.ask(forMode());

		if (shouldPass) {
			expect(env).toEqual(expected);
			return;
		}

		expect(env).not.toEqual(expected);
	},
);
