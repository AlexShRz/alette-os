import { requestCategory, requestSpecification, type } from "@alette/pulse";
import { baseRequest, blueprint } from "../blueprint";
import { allRequestMiddleware } from "../interceptors/middleware/commonAcceptedMiddleware";
import { input } from "../interceptors/middleware/input";
import { defineApiPlugin } from "../plugins";

const { plugin, pluginRuntime } = defineApiPlugin("alette-signal/core");

const queryCategory = requestCategory("baseQuery");

const querySpec = requestSpecification()
	.categorizedAs(baseRequest, queryCategory)
	.accepts(...allRequestMiddleware)
	.build();

const queryFactory = blueprint()
	.specification(querySpec)
	.executor(pluginRuntime)
	// .use(input(type()))
	.build();

export const coreApiPlugin = () =>
	plugin
		.exposes(() => ({
			query: queryFactory.asFunction(),
		}))
		.build();

const core = coreApiPlugin();

const { query } = core.use();

const getPost = query(input(type<{ heyThere: string }>()));

const controller = getPost.execute({ args: { heyThere: "asd" } });
