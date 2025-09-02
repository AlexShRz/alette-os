import {
	Exception,
	requestCategory,
	requestSpecification,
	type,
} from "@alette/pulse";
import { path, input, origin, throws } from "../../domain";
import { baseRequest } from "../../domain";
import { allRequestMiddleware } from "../../domain";
import { IRequestContext } from "../../domain/context/IRequestContext";
import {
	IRecoverableApiError,
	TAddDefaultErrors,
} from "../../domain/errorHandling/middleware/throws/RequestRecoverableErrors";
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

class MyError extends Exception.Recoverable() {}
class MyError2 extends Exception.Recoverable() {}

const getPost = query(
	input(type<{ heyThere: "hello" }>()),
	origin("https://www.wikipedia.org/"),
	path("/heyy"),
	path((prevPath, { path, args: { heyThere }, origin }) => `heyy/${heyThere}`),
	path((prevPath, { path, args }) => "heyy"),
	throws(MyError, MyError2),
	// origin((prev, { origin }) => "https://www.wikipedia.org/hhhh"),
	// throws(
	// 	HttpException,
	// 	...
	// )
);

const controller = getPost.execute({ args: { heyThere: "hello" } });
