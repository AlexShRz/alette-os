import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const originMiddlewareName = middlewareCategory("originMiddlewareName");

export const originMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(originMiddlewareName, creationalMiddleware)
	.build();
