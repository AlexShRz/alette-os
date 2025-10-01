import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const originMiddlewareName = middlewareCategory("originMiddlewareName");

export const originMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(originMiddlewareName, creationalMiddleware)
	.build();
