import { requestSpecification } from "@alette/pulse";
import {
	allRequestMiddleware,
	baseRequest,
	factoryMiddlewareName,
	origin,
} from "../../domain";
import { blueprint } from "../oneShotRequest/RequestBlueprintBuilder";

export const customRequestSpec = requestSpecification()
	.categorizedAs(baseRequest)
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	.build();

export const customRequestFactory = blueprint()
	.specification(customRequestSpec)
	.use(origin());
