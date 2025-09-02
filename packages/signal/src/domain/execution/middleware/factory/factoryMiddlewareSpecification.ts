import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { executionMiddleware } from "../../../middleware";

export const factoryMiddlewareName = middlewareCategory(
	"factoryMiddlewareName",
);

export const factoryMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(factoryMiddlewareName, executionMiddleware)
	.build();
