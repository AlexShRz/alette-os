import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const sharedMiddlewareName = middlewareCategory("sharedMiddlewareName");

export const sharedMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(sharedMiddlewareName, behaviouralMiddleware)
	.build();
