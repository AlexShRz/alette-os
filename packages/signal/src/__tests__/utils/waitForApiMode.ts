import { Effect as E, Stream } from "effect";
import {
	EnvironmentMode,
	TApiEnvironmentMode,
} from "../../domain/environment/EnvironmentMode";

export const waitForApiMode = (awaitedMode: TApiEnvironmentMode) =>
	E.gen(function* () {
		const env = yield* EnvironmentMode;
		yield* env.track().pipe(
			Stream.filter((mode) => mode === awaitedMode),
			Stream.take(1),
			Stream.runDrain,
		);
	});
