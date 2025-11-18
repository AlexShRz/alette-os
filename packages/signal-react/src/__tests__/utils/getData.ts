import { as, input, output, queryParams, runOnMount } from "@alette/signal";
import { query } from "./api";

export const getData = query(
	input(as<string>()),
	output(as<string>()),
	queryParams(({ args }) => ({ id: args })),
);

export const getData2 = query(output(as<string>()), runOnMount(false));
