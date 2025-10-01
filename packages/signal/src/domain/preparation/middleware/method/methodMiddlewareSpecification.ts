import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const methodMiddlewareName = middlewareCategory("methodMiddlewareName");

export const methodMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(methodMiddlewareName, creationalMiddleware)
	.build();
