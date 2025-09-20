import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const bodyMiddlewareName = middlewareCategory("bodyMiddlewareName");

export const bodyMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(bodyMiddlewareName, creationalMiddleware)
	.build();
