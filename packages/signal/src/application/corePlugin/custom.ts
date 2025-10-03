import {
	allRequestMiddleware,
	baseRequest,
	factoryMiddlewareName,
	origin,
	reloadable,
	runOnMount,
} from "../../domain";
import { requestSpecification } from "../../domain/specification";
import { blueprint } from "../oneShotRequest";
import { withRecognizedErrors } from "./sharedMiddleware";

export const customRequestSpec = requestSpecification()
	.categorizedAs(baseRequest)
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	.build();

export const customRequestFactory = blueprint()
	.specification(customRequestSpec)
	.use(origin(), runOnMount(false), reloadable(), withRecognizedErrors());
