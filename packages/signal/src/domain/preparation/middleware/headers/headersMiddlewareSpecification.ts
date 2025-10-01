import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const headersMiddlewareName = middlewareCategory(
	"headersMiddlewareName",
);

export const headersMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(headersMiddlewareName, creationalMiddleware)
	.build();
