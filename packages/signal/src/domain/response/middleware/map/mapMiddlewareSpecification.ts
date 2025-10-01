import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const mapMiddlewareName = middlewareCategory("mapMiddlewareName");

export const mapMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(mapMiddlewareName, mapperMiddleware)
	.build();
