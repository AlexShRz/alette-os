import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../middleware";

export const headersMiddlewareName = middlewareCategory(
	"headersMiddlewareName",
);

export const headersMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(headersMiddlewareName, creationalMiddleware)
	.build();
