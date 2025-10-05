import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapCancelMiddlewareName = middlewareCategory(
	"tapCancelMiddlewareName",
);

export const tapCancelMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapCancelMiddlewareName, mapperMiddleware)
	.build();
