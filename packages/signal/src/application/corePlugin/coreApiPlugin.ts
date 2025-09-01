import { requestCategory, requestSpecification, type } from "@alette/pulse";
import { path, input, origin } from "../../domain";
import { baseRequest } from "../../domain/categorization/baseRequestCategories";
import { allRequestMiddleware } from "../../domain/categorization/commonAcceptedMiddleware";
import { blueprint } from "../oneShotRequest/RequestBlueprintBuilder";
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
	.use(origin())
	.build();

export const coreApiPlugin = () =>
	plugin
		.exposes(() => ({
			query: queryFactory.asFunction(),
		}))
		.build();

const core = coreApiPlugin();

const { query } = core.use();

const getPost = query(
	input(type<{ heyThere: "hello" }>()),
	origin("https://www.wikipedia.org/"),
	path("/heyy"),
	path((prevPath, { path, args: { heyThere }, origin }) => `heyy/${heyThere}`),
	path((prevPath, { path, args }) => "heyy"),
	// origin((prev, { origin }) => "https://www.wikipedia.org/hhhh"),
);

const controller = getPost.execute({ args: { heyThere: "hello" } });
