import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const tapMiddlewareName = middlewareCategory("tapMiddlewareName");

export const tapMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapMiddlewareName, mapperMiddleware)
	.build();
