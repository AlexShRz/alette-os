import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const urlMiddlewareName = middlewareCategory("urlMiddlewareName");

export const urlMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(urlMiddlewareName, creationalMiddleware)
	.build();
