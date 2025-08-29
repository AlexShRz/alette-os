import { middlewareCategory, middlewareSpecification } from "@alette/pulse";

export const inputMiddlewareName = middlewareCategory("inputMiddlewareName");

export const inputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(inputMiddlewareName)
	.build();
