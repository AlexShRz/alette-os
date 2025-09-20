import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const inputMiddlewareName = middlewareCategory("inputMiddlewareName");

export const inputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(inputMiddlewareName, creationalMiddleware)
	.build();
