import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const pathMiddlewareName = middlewareCategory("pathMiddlewareName");

export const pathMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(pathMiddlewareName, creationalMiddleware)
	.build();
