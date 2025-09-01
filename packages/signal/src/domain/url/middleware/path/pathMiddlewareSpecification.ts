import { middlewareCategory, middlewareSpecification } from "@alette/pulse";

export const pathMiddlewareName = middlewareCategory("pathMiddlewareName");

export const pathMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(pathMiddlewareName)
	.build();
