import { executionMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const factoryMiddlewareName = middlewareCategory(
	"factoryMiddlewareName",
);

export const factoryMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(factoryMiddlewareName, executionMiddleware)
	.build();
