import * as E from "effect/Effect";
import { TRecognizedApiDuration } from "./types";

export const wait = (duration: TRecognizedApiDuration) =>
	E.runPromise(E.sleep(duration));
