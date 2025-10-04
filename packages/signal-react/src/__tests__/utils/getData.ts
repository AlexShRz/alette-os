import { input, output, queryParams, type } from "@alette/signal";
import { query } from "./api";

export const getData = query(
	input(type<string>()),
	output(type<string>()),
	queryParams(({ args }) => ({ id: args })),
);
