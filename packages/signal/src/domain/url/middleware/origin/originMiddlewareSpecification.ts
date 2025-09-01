import { middlewareCategory, middlewareSpecification } from "@alette/pulse";

export const originMiddlewareName = middlewareCategory("originMiddlewareName");

export const originMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(originMiddlewareName)
	.build();
