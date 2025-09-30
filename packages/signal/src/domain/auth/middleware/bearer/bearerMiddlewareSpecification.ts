import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const bearerMiddlewareName = middlewareCategory("bearerMiddlewareName");

export const bearerMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(bearerMiddlewareName, creationalMiddleware)
	.build();
