import { creationalMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const credentialsMiddlewareName = middlewareCategory(
	"credentialsMiddlewareName",
);

export const credentialsMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(credentialsMiddlewareName, creationalMiddleware)
	.build();
