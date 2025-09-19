import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const mapErrorMiddlewareName = middlewareCategory(
	"mapErrorMiddlewareName",
);

export const mapErrorMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(mapErrorMiddlewareName, mapperMiddleware)
	.build();
