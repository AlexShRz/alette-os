import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const methodMiddlewareName = middlewareCategory("methodMiddlewareName");

export const methodMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(methodMiddlewareName, creationalMiddleware)
	.build();
