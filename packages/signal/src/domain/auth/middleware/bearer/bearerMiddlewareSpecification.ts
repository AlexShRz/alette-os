import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const bearerMiddlewareName = middlewareCategory("bearerMiddlewareName");

export const bearerMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(bearerMiddlewareName, creationalMiddleware)
	.build();
