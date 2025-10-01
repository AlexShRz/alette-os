import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const throwsMiddlewareName = middlewareCategory("throwsMiddlewareName");

export const throwsMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(throwsMiddlewareName, creationalMiddleware)
	.build();
