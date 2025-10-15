import {
	allRequestMiddleware,
	baseRequest,
	factory,
	factoryMiddlewareName,
	origin,
	reloadable,
	retry,
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
	.use(
		origin(),
		runOnMount(false),
		reloadable(),
		withRecognizedErrors(),
		factory(() => {
			throw new Error(
				'[Custom request blueprint] - the "factory()" middleware was not provided.',
			);
		}),
		retry({
			times: 1,
			whenStatus: [401, 419],
		}),
	);
