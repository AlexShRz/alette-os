import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const tapErrorMiddlewareName = middlewareCategory(
	"tapErrorMiddlewareName",
);

export const tapErrorMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapErrorMiddlewareName, mapperMiddleware)
	.build();
