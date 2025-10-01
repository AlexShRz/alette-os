import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const urlMiddlewareName = middlewareCategory("urlMiddlewareName");

export const urlMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(urlMiddlewareName, creationalMiddleware)
	.build();
