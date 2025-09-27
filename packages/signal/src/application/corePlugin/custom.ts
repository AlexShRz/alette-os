import { RequestFailedError, requestSpecification } from "@alette/pulse";
import {
	allRequestMiddleware,
	baseRequest,
	factoryMiddlewareName,
	origin,
	reloadable,
	runOnMount,
	throws,
} from "../../domain";
import { blueprint } from "../oneShotRequest";

export const customRequestSpec = requestSpecification()
	.categorizedAs(baseRequest)
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	.build();

export const customRequestFactory = blueprint()
	.specification(customRequestSpec)
	.use(origin(), runOnMount(false), reloadable(), throws(RequestFailedError));
