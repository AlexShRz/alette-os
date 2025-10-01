import { RequestFailedError } from "@alette/pulse";
import {
	allRequestMiddleware,
	baseRequest,
	factoryMiddlewareName,
	origin,
	reloadable,
	runOnMount,
	throws,
} from "../../domain";
import { requestSpecification } from "../../domain/specification";
import { blueprint } from "../oneShotRequest";

export const customRequestSpec = requestSpecification()
	.categorizedAs(baseRequest)
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	.build();

export const customRequestFactory = blueprint()
	.specification(customRequestSpec)
	.use(origin(), runOnMount(false), reloadable(), throws(RequestFailedError));
