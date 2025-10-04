import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapUnmountMiddlewareName = middlewareCategory(
	"tapUnmountMiddlewareName",
);

export const tapUnmountMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapUnmountMiddlewareName, mapperMiddleware)
	.build();
