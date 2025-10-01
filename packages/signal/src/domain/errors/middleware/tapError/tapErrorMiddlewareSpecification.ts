import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapErrorMiddlewareName = middlewareCategory(
	"tapErrorMiddlewareName",
);

export const tapErrorMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapErrorMiddlewareName, mapperMiddleware)
	.build();
