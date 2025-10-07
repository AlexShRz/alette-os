import { path, as, input, output, retry } from "@alette/signal";
import { mutation, query } from "./base";

export const sendEvent = mutation(
	input(as<{ name: string; context: unknown }>()),
);
