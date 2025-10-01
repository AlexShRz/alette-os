import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapMiddlewareName = middlewareCategory("tapMiddlewareName");

export const tapMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapMiddlewareName, mapperMiddleware)
	.build();
