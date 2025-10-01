import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const mapErrorMiddlewareName = middlewareCategory(
	"mapErrorMiddlewareName",
);

export const mapErrorMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(mapErrorMiddlewareName, mapperMiddleware)
	.build();
