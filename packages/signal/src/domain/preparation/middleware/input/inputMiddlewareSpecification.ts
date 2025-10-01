import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const inputMiddlewareName = middlewareCategory("inputMiddlewareName");

export const inputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(inputMiddlewareName, creationalMiddleware)
	.build();
