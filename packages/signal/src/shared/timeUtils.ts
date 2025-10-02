import * as Duration from "effect/Duration";
import { TRecognizedApiDuration } from "./types";

export const wait = (duration: TRecognizedApiDuration) =>
	new Promise<void>((res) =>
		setTimeout(() => res(), Duration.toMillis(Duration.decode(duration))),
	);
