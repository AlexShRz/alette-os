import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const retryWhenMiddlewareName = middlewareCategory(
	"retryWhenMiddlewareName",
);

export const retryWhenMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(retryWhenMiddlewareName, mapperMiddleware)
	.build();
