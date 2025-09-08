import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const outputMiddlewareName = middlewareCategory("outputMiddlewareName");

export const outputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(outputMiddlewareName, creationalMiddleware)
	.build();
