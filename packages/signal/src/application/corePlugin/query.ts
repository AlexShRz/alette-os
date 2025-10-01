import { RequestFailedError } from "@alette/pulse";
import {
	allRequestMiddleware,
	baseRequest,
	origin,
	reloadable,
	requestCategory,
	requestSpecification,
	runOnMount,
	throws,
} from "../../domain";
import { blueprint } from "../oneShotRequest";

export const queryCategory = requestCategory("baseQuery");

const querySpec = requestSpecification()
	.categorizedAs(baseRequest, queryCategory)
	.accepts(...allRequestMiddleware)
	.build();

export const queryFactory = blueprint()
	.specification(querySpec)
	.use(origin(), runOnMount(true), reloadable(), throws(RequestFailedError));
