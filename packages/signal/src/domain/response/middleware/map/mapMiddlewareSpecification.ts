import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const mapMiddlewareName = middlewareCategory("mapMiddlewareName");

export const mapMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(mapMiddlewareName, mapperMiddleware)
	.build();
