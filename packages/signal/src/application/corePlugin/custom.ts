import { RequestAbortedError } from "@alette/pulse";
import {
	allRequestMiddleware,
	baseRequest,
	factoryMiddlewareName,
	origin,
	reloadable,
	retry,
	runOnMount,
	throws,
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
	.use(
		origin(),
		runOnMount(false),
		reloadable(),
		withRecognizedErrors(),
		throws(RequestAbortedError),
		retry({
			times: 1,
			whenStatus: [401],
		}),
	);
