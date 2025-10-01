import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const queryParamsMiddlewareName = middlewareCategory(
	"queryParamsMiddlewareName",
);

export const queryParamsMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(queryParamsMiddlewareName, creationalMiddleware)
	.build();
