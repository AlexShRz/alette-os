import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const outputMiddlewareName = middlewareCategory("outputMiddlewareName");

export const outputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(outputMiddlewareName, creationalMiddleware)
	.build();
