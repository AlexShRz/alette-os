import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapLoadingMiddlewareName = middlewareCategory(
	"tapLoadingMiddlewareName",
);

export const tapLoadingMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapLoadingMiddlewareName, mapperMiddleware)
	.build();
