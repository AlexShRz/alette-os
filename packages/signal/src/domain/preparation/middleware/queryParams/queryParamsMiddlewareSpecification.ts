import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const queryParamsMiddlewareName = middlewareCategory(
	"queryParamsMiddlewareName",
);

export const queryParamsMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(queryParamsMiddlewareName, creationalMiddleware)
	.build();
