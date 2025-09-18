import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const throwsMiddlewareName = middlewareCategory("throwsMiddlewareName");

export const throwsMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(throwsMiddlewareName, creationalMiddleware)
	.build();
