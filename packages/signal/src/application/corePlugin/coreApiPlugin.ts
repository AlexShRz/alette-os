import { type } from "@alette/pulse";
import { path, input, output, reloadable, responseAdapter } from "../../domain";
import { defineApiPlugin } from "../plugins";
import { customRequestFactory } from "./custom";
import { queryFactory } from "./query";

export const coreApiPlugin = () => {
	const { plugin, pluginRuntime } = defineApiPlugin("alette-signal/core");

	const query = queryFactory.executor(pluginRuntime).build();
	const custom = customRequestFactory.executor(pluginRuntime).build();

	return plugin
		.exposes(() => ({
			query: query.asFunction(),
			custom: custom.asFunction(),
		}))
		.build();
};

const plugin = coreApiPlugin();

const { query } = plugin.use();
//
// const out1 = output(type<{ heyyy: string }>());
// const out2 = output(
// 	responseAdapter().schema(type<{ heyyy: string }>()).build(),
// );

const getPost = query(
	input(type<string>()),
	output(responseAdapter().schema(type<{ heyyy: string }>()).build()),
	path("/hey"),
	reloadable(({ prev, current }) => {
		return prev?.args !== current.args;
	}),
);

// const asdas = getPost.execute({  });

// const getPost = query(
// 	input(type<string>()),
// 	out2(),
// 	path("/hey"),
// 	reloadable(({ prev, current }) => {
// 		return prev?.args !== current.args;
// 	}),
// );
