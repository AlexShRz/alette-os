import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const pathMiddlewareName = middlewareCategory("pathMiddlewareName");

export const pathMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(pathMiddlewareName, creationalMiddleware)
	.build();
