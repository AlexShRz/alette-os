import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const bodyMiddlewareName = middlewareCategory("bodyMiddlewareName");

export const bodyMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(bodyMiddlewareName, creationalMiddleware)
	.build();
