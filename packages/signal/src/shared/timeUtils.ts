import * as Duration from "effect/Duration";
import { TRecognizedApiDuration } from "./types";

export const wait = (duration: TRecognizedApiDuration) =>
	new Promise<true>((res) =>
		setTimeout(() => res(true), Duration.toMillis(Duration.decode(duration))),
	);
