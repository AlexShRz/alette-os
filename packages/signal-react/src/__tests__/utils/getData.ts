import { as, input, output, queryParams } from "@alette/signal";
import { query } from "./api";

export const getData = query(
	input(as<string>()),
	output(as<string>()),
	queryParams(({ args }) => ({ id: args })),
);
